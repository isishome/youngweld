import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { test } from 'node:test'
import { isAppPath, normalizeEntryUrl } from '../src/routes/entry-url.js'
import { resolveLocale } from '../src/locales/registry.js'

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
      assert.equal(response.uri, '/index.html')
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

test('rewrite는 쿼리의 반복 값과 인코딩을 변경하지 않는다', () => {
  const querystring = {
    tag: { multiValue: [{ value: 'a%26b' }, { value: '%ED%95%9C' }] },
    q: { value: '%ZZ' },
  }
  const original = request('/company/', querystring)
  const result = handler({ request: original })
  assert.equal(result, original)
  assert.equal(result.uri, '/index.html')
  assert.equal(result.querystring, querystring)
})

test('슬래시와 이전 북마크를 path 주소로 정규화', () => {
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
  assert.equal(target, '/company?a=1')
  window.location.hash = '#/support'
  normalizeEntryUrl()
  assert.equal(target, '/support?a=1')
  window.location.hash = '#/product/control/YM001/?a=2#manual'
  normalizeEntryUrl()
  assert.equal(target, '/product/control/YM001?a=1&a=2#manual')
  delete globalThis.window
})

test('지원하지 않는 브라우저 언어·쿠키는 리디렉션 루프 없이 한국어로 대체', () => {
  assert.equal(resolveLocale(null, 'xx-XX'), 'ko')
  assert.equal(resolveLocale('invalid', 'en-US'), 'ko')
  assert.equal(resolveLocale(null, 'en-US'), 'en')
  assert.equal(resolveLocale('ko', 'en-US'), 'ko')
})

test('브라우저 언어의 지역·표기 변형을 지원 언어로 연결', () => {
  for (const [tag, locale] of Object.entries({
    'ja-JP': 'ja',
    'de-AT': 'de',
    'fr-CA': 'fr',
    'zh-Hant-HK': 'zh-TW',
    zh_HK: 'zh-TW',
    'zh-Hans-CN': 'zh-CN',
    'es-MX': 'es-MX',
    'es-AR': 'es-ES',
    'pt-PT': 'pt-BR',
    'pl-PL': 'pl',
    'ru-RU': 'ru',
  }))
    assert.equal(resolveLocale(null, tag), locale)
})
