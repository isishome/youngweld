import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

const policy = JSON.parse(
  readFileSync('infra/cloudfront/response-headers-policy.json', 'utf8'),
).ResponseHeadersPolicyConfig
test('실행 스크립트와 프레임 출처 제한 및 보안 헤더', () => {
  const security = policy.SecurityHeadersConfig
  const csp = security.ContentSecurityPolicy.ContentSecurityPolicy
  assert.match(csp, /script-src 'self';/)
  assert.doesNotMatch(csp, /unsafe-eval/)
  assert.match(csp, /frame-ancestors 'none'/)
  assert.match(csp, /frame-src https:\/\/www.google.com/)
  assert.equal(security.FrameOptions.FrameOption, 'DENY')
  assert.equal(security.ContentTypeOptions.Override, true)
  assert.ok(security.StrictTransportSecurity.AccessControlMaxAgeSec >= 31536000)
  assert.equal(security.StrictTransportSecurity.IncludeSubdomains, false)
  assert.equal(
    security.ReferrerPolicy.ReferrerPolicy,
    'strict-origin-when-cross-origin',
  )
})

test('초기 HTML의 확대 허용·검색 설명·LCP 사전 로드', () => {
  const html = readFileSync('dist/index.html', 'utf8')
  assert.doesNotMatch(
    html,
    /maximum-scale|user-scalable|<%|http-equiv="X-UA-Compatible"/,
  )
  assert.match(html, /name="description"/)
  assert.match(html, /yesawcg001.webp/)
  assert.doesNotMatch(html, /fonts.googleapis.com|fonts.gstatic.com/)
})
