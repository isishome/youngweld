import { execFileSync } from 'node:child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

export const planDistribution = (config, functionArn, policyId) => {
  const next = structuredClone(config)
  const behavior = next.DefaultCacheBehavior
  const functions = behavior.FunctionAssociations?.Items || []
  const viewerFunction = functions.find(
    (item) => item.EventType === 'viewer-request',
  )
  if (viewerFunction && viewerFunction.FunctionARN !== functionArn)
    throw new Error(
      '기존 viewer-request 함수가 있습니다. 기존 로직을 먼저 통합해야 합니다.',
    )
  if (
    behavior.LambdaFunctionAssociations?.Items?.some(
      (item) => item.EventType === 'viewer-request',
    )
  )
    throw new Error(
      '기존 viewer-request Lambda@Edge 연결을 자동 교체하지 않습니다.',
    )
  if (
    behavior.ResponseHeadersPolicyId &&
    behavior.ResponseHeadersPolicyId !== policyId
  )
    throw new Error(
      '기존 응답 헤더 정책을 자동 교체하지 않습니다. 정책 내용을 먼저 검토해야 합니다.',
    )
  behavior.FunctionAssociations = {
    Quantity:
      functions.filter((item) => item.EventType !== 'viewer-request').length +
      1,
    Items: [
      ...functions.filter((item) => item.EventType !== 'viewer-request'),
      { EventType: 'viewer-request', FunctionARN: functionArn },
    ],
  }
  behavior.ResponseHeadersPolicyId = policyId
  behavior.ViewerProtocolPolicy = 'redirect-to-https'
  behavior.Compress = true
  next.DefaultRootObject = 'index.html'
  const errors = (next.CustomErrorResponses?.Items || []).filter(
    (item) =>
      !(
        [403, 404].includes(item.ErrorCode) &&
        item.ResponseCode === '200' &&
        item.ResponsePagePath === '/index.html'
      ),
  )
  next.CustomErrorResponses = errors.length
    ? { Quantity: errors.length, Items: errors }
    : { Quantity: 0 }
  return next
}

export const rollbackFields = (config) => ({
  DefaultRootObject: config.DefaultRootObject,
  CustomErrorResponses: config.CustomErrorResponses,
  DefaultCacheBehavior: {
    FunctionAssociations: config.DefaultCacheBehavior.FunctionAssociations,
    ResponseHeadersPolicyId:
      config.DefaultCacheBehavior.ResponseHeadersPolicyId || null,
    ViewerProtocolPolicy: config.DefaultCacheBehavior.ViewerProtocolPolicy,
    Compress: config.DefaultCacheBehavior.Compress,
  },
})

export const sanitizeAwsError = (operation, error) => {
  const code =
    String(error.stderr || '').match(/\(([A-Za-z0-9]+)\)/)?.[1] || '실행 오류'
  return new Error(
    `CloudFront ${operation} 실패: ${code}. 요청 설정과 자격증명은 출력하지 않습니다.`,
    { cause: { code, exitCode: error.status } },
  )
}

export const validateFunctionRequest = (result, uri) => {
  if (result.FunctionErrorMessage) throw new Error(result.FunctionErrorMessage)
  const request = JSON.parse(result.FunctionOutput).request
  if (request?.uri !== uri)
    throw new Error('CloudFront 함수 실제 런타임 검증 실패')
}

export const selectPolicyId = (config, existingPolicy, routesOnly) => {
  if (!routesOnly) return existingPolicy?.Id || '<새 정책 ID>'
  const policyId = config.DefaultCacheBehavior.ResponseHeadersPolicyId
  if (!policyId) throw new Error('보존할 기존 보안 헤더 정책이 없습니다.')
  return policyId
}

const aws = (...args) => {
  try {
    return JSON.parse(
      execFileSync(
        'aws',
        ['cloudfront', ...args, '--output', 'json', '--no-cli-pager'],
        { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
      ),
    )
  } catch (error) {
    throw sanitizeAwsError(args[0], error)
  }
}

const main = () => {
  const distributionId = process.env.DISTRIBUTION_ID
  if (!/^[A-Z0-9]+$/.test(distributionId || ''))
    throw new Error('DISTRIBUTION_ID가 필요합니다.')
  const functionName = `youngweld-routes-${distributionId.toLowerCase()}`
  const policyName = `youngweld-security-${distributionId.toLowerCase()}`
  const current = aws('get-distribution-config', '--id', distributionId)
  const functions =
    aws('list-functions', '--stage', 'DEVELOPMENT').FunctionList?.Items || []
  const existingFunction = functions.find((item) => item.Name === functionName)
  const policies =
    aws('list-response-headers-policies', '--type', 'custom')
      .ResponseHeadersPolicyList?.Items || []
  const existingPolicy = policies.find(
    (item) =>
      item.ResponseHeadersPolicy.ResponseHeadersPolicyConfig.Name ===
      policyName,
  )?.ResponseHeadersPolicy
  const functionArn =
    existingFunction?.FunctionMetadata.FunctionARN || '<새 함수 ARN>'
  const routesOnly = process.env.ROUTES_ONLY === 'true'
  const policyId = selectPolicyId(
    current.DistributionConfig,
    existingPolicy,
    routesOnly,
  )
  const planned = planDistribution(
    current.DistributionConfig,
    functionArn,
    policyId,
  )
  console.log(
    '변경 전 복구 필드 (오리진·사용자 정의 요청 헤더는 출력하지 않음):',
  )
  console.log(
    JSON.stringify(rollbackFields(current.DistributionConfig), null, 2),
  )
  console.log('예정 변경:')
  console.log(JSON.stringify(rollbackFields(planned), null, 2))
  if (process.env.APPLY_CHANGES !== 'true') {
    console.log('조회 완료. 실제 변경은 수행하지 않았습니다.')
    return
  }

  const functionConfig = JSON.stringify({
    Comment: 'Youngil Electric history route rewrite',
    Runtime: 'cloudfront-js-2.0',
  })
  let savedFunction
  if (existingFunction) {
    const described = aws(
      'describe-function',
      '--name',
      functionName,
      '--stage',
      'DEVELOPMENT',
    )
    savedFunction = aws(
      'update-function',
      '--name',
      functionName,
      '--if-match',
      described.ETag,
      '--function-config',
      functionConfig,
      '--function-code',
      'fileb://infra/cloudfront/viewer-request.js',
    )
  } else {
    savedFunction = aws(
      'create-function',
      '--name',
      functionName,
      '--function-config',
      functionConfig,
      '--function-code',
      'fileb://infra/cloudfront/viewer-request.js',
    )
  }
  mkdirSync('.tmp/cloudfront', { recursive: true })
  for (const [uri, expectedUri] of [
    ['/', '/index.html'],
    ['/company/', '/index.html'],
    ['/product/submerged/YESAWCG-001/', '/index.html'],
    ['/missing.js', '/missing.js'],
    ['/static/manual/YM001.pdf', '/static/manual/YM001.pdf'],
  ]) {
    const event = {
      version: '1.0',
      context: { eventType: 'viewer-request' },
      viewer: { ip: '192.0.2.1' },
      request: {
        method: 'GET',
        uri,
        querystring: {},
        headers: { host: { value: 'youngweld.com' } },
        cookies: {},
      },
    }
    writeFileSync('.tmp/cloudfront/event.json', JSON.stringify(event))
    const result = aws(
      'test-function',
      '--name',
      functionName,
      '--if-match',
      savedFunction.ETag,
      '--stage',
      'DEVELOPMENT',
      '--event-object',
      'fileb://.tmp/cloudfront/event.json',
    ).TestResult
    validateFunctionRequest(result, expectedUri)
  }
  let finalPolicyId = policyId
  if (!routesOnly) {
    const config = JSON.parse(
      readFileSync('infra/cloudfront/response-headers-policy.json', 'utf8'),
    ).ResponseHeadersPolicyConfig
    config.Name = policyName
    let savedPolicy
    if (existingPolicy) {
      const previous = aws(
        'get-response-headers-policy',
        '--id',
        existingPolicy.Id,
      )
      savedPolicy = aws(
        'update-response-headers-policy',
        '--id',
        existingPolicy.Id,
        '--if-match',
        previous.ETag,
        '--response-headers-policy-config',
        JSON.stringify(config),
      )
    } else {
      savedPolicy = aws(
        'create-response-headers-policy',
        '--response-headers-policy-config',
        JSON.stringify(config),
      )
    }
    finalPolicyId = savedPolicy.ResponseHeadersPolicy.Id
  }
  aws(
    'publish-function',
    '--name',
    functionName,
    '--if-match',
    savedFunction.ETag,
  )
  const final = planDistribution(
    current.DistributionConfig,
    savedFunction.FunctionSummary.FunctionMetadata.FunctionARN,
    finalPolicyId,
  )
  aws(
    'update-distribution',
    '--id',
    distributionId,
    '--if-match',
    current.ETag,
    '--distribution-config',
    JSON.stringify(final),
  )
  execFileSync(
    'aws',
    ['cloudfront', 'wait', 'distribution-deployed', '--id', distributionId],
    { stdio: 'inherit' },
  )
  aws(
    'create-invalidation',
    '--distribution-id',
    distributionId,
    '--paths',
    '/*',
  )
  console.log('CloudFront 반영 완료. 운영 URL의 경로·헤더·기능을 확인하세요.')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main()
