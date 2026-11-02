import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'
import { isAppPath, normalizeEntryUrl } from '../src/routes/entry-url.js'
import { resolveLocale } from '../src/i18n.js'

const source = readFileSync('infra/cloudfront/viewer-request.js', 'utf8')
const handler = runInNewContext(`${source}\nhandler`)
const request = (uri, querystring = {}) => ({ uri, querystring, method: 'GET' })

for (const path of [
  '/company',
  '/location',
  '/product',
  '/product/submerged',
  '/product/submerged/YESAWCG-001',
  '/support/control',
  '/404',
]) {
  test(`직접 경로와 슬래시 정규화: ${path}`, () => {
    for (const suffix of ['', '/', '//']) {
      assert.equal(isAppPath(path + suffix), true)
      const response = handler({ request: request(path + suffix) })
      assert.equal(response.statusCode, 302)
      assert.equal(response.headers.location.value, `/#${path}`)
    }
  })
}

test('루트는 index.html, 자산과 알 수 없는 경로는 원래 요청 유지', () => {
  assert.equal(handler({ request: request('/') }).uri, '/index.html')
  for (const path of [
    '/assets/app.js',
    '/static/manual/YM001.pdf',
    '/missing.js',
    '/other/',
    '/product/a/b/c',
    '//evil.example',
    '/company%0d%0a',
  ]) {
    const original = request(path)
    assert.equal(isAppPath(path), false)
    assert.equal(handler({ request: original }), original)
  }
})

test('쿼리의 반복 값과 URL 인코딩을 보존하고 헤더 삽입을 막는다', () => {
  const response = handler({
    request: request('/company/', {
      tag: {
        multiValue: [{ value: 'a%26b' }, { value: '%ED%95%9C%EA%B8%80' }],
      },
      q: { value: 'a+b' },
      unsafe: { value: '\r\n#evil' },
    }),
  })
  const location = response.headers.location.value
  const url = new URL(location, 'https://youngweld.com')
  assert.deepEqual(url.searchParams.getAll('tag'), ['a&b', '한글'])
  assert.equal(url.searchParams.get('q'), 'a b')
  assert.equal(url.hash, '#/company')
  assert.equal(/[\r\n]/.test(location), false)
})

test('기존 CDN HTML fallback에서도 브라우저 진입 주소 정규화', () => {
  let target
  globalThis.window = {
    location: { pathname: '/company/', search: '?a=1', hash: '' },
    history: {
      replaceState: (_, __, value) => {
        target = value
      },
    },
  }
  normalizeEntryUrl()
  assert.equal(target, '/?a=1#/company')
  window.location.hash = '#/support'
  normalizeEntryUrl()
  assert.equal(target, '/?a=1#/support')
  delete globalThis.window
})

test('지원하지 않는 브라우저 언어·쿠키는 리디렉션 루프 없이 한국어로 대체', () => {
  assert.equal(resolveLocale(null, 'ja-JP'), 'ko')
  assert.equal(resolveLocale('invalid', 'en-US'), 'ko')
  assert.equal(resolveLocale(null, 'en-US'), 'en')
  assert.equal(resolveLocale('ko', 'en-US'), 'ko')
})
