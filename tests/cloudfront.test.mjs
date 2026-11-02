import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  planDistribution,
  rollbackFields,
  sanitizeAwsError,
  validateFunctionRequest,
} from '../scripts/configure-cloudfront.mjs'

test('AWS TestFunction request 래퍼와 rewrite 결과를 검사한다', () => {
  const result = {
    FunctionOutput: JSON.stringify({ request: { uri: '/index.html' } }),
  }
  assert.doesNotThrow(() => validateFunctionRequest(result, '/index.html'))
  assert.throws(() => validateFunctionRequest(result, '/missing.js'))
  assert.throws(() =>
    validateFunctionRequest(
      { FunctionOutput: '{"uri":"/index.html"}' },
      '/index.html',
    ),
  )
  assert.throws(() =>
    validateFunctionRequest(
      { FunctionErrorMessage: 'SyntaxError' },
      '/index.html',
    ),
  )
})

test('AWS 실행 실패 원문·명령·출력의 비밀값을 재노출하지 않음', () => {
  const error = Object.assign(new Error('command --secret private-value'), {
    stderr: 'An error occurred (AccessDenied): private-value',
    stdout: 'private-value',
    status: 254,
  })
  const safe = sanitizeAwsError('update-distribution', error)
  assert.match(safe.message, /AccessDenied/)
  assert.doesNotMatch(safe.stack + JSON.stringify(safe.cause), /private-value/)
  assert.equal(safe.cause.exitCode, 254)
})

const config = () => ({
  Origins: {
    Items: [
      {
        Id: 'origin',
        CustomHeaders: { Items: [{ HeaderValue: 'private-value' }] },
      },
    ],
  },
  DefaultRootObject: '',
  DefaultCacheBehavior: {
    TargetOriginId: 'origin',
    CachePolicyId: 'existing-cache',
    FunctionAssociations: { Quantity: 0 },
    ViewerProtocolPolicy: 'allow-all',
    Compress: false,
  },
  CacheBehaviors: { Quantity: 1, Items: [{ PathPattern: '/special/*' }] },
  CustomErrorResponses: {
    Quantity: 2,
    Items: [
      { ErrorCode: 403, ResponseCode: '200', ResponsePagePath: '/index.html' },
      {
        ErrorCode: 500,
        ResponseCode: '503',
        ResponsePagePath: '/maintenance.html',
      },
    ],
  },
})

test('원본·별도 동작을 유지하고 기본 동작만 변경', () => {
  const current = config()
  const before = structuredClone(current)
  const result = planDistribution(current, 'function-arn', 'policy-id')
  assert.deepEqual(current, before)
  assert.deepEqual(result.Origins, current.Origins)
  assert.deepEqual(result.CacheBehaviors, current.CacheBehaviors)
  assert.equal(result.DefaultCacheBehavior.CachePolicyId, 'existing-cache')
  assert.equal(
    result.DefaultCacheBehavior.ViewerProtocolPolicy,
    'redirect-to-https',
  )
  assert.equal(result.DefaultCacheBehavior.ResponseHeadersPolicyId, 'policy-id')
  assert.equal(result.CustomErrorResponses.Quantity, 1)
  assert.equal(result.CustomErrorResponses.Items[0].ErrorCode, 500)
  assert.deepEqual(
    planDistribution(result, 'function-arn', 'policy-id'),
    result,
  )
})

test('기존 함수·Lambda·응답 정책 충돌은 변경 전에 거부', () => {
  for (const changes of [
    {
      FunctionAssociations: {
        Items: [{ EventType: 'viewer-request', FunctionARN: 'other' }],
      },
    },
    {
      LambdaFunctionAssociations: { Items: [{ EventType: 'viewer-request' }] },
    },
    { ResponseHeadersPolicyId: 'other' },
  ]) {
    const current = config()
    Object.assign(current.DefaultCacheBehavior, changes)
    assert.throws(
      () => planDistribution(current, 'function-arn', 'policy-id'),
      /기존/,
    )
  }
})

test('복구 출력에 오리진 사용자 정의 헤더를 노출하지 않음', () => {
  assert.doesNotMatch(
    JSON.stringify(rollbackFields(config())),
    /private-value|Origins/,
  )
})
