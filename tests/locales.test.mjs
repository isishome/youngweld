import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { LOCALE_OPTIONS } from '../src/locales/registry.js'

const read = (locale) =>
  JSON.parse(readFileSync(`src/locales/${locale}.json`, 'utf8'))
const base = read('en')
const metadata = new Set([
  'src',
  'to',
  'icon',
  'color',
  'code',
  'sec',
  'direction',
  'align',
  'header',
  'value',
])

const check = (actual, expected, path = '') => {
  assert.equal(typeof actual, typeof expected, path)
  if (expected && typeof expected === 'object') {
    assert.equal(Array.isArray(actual), Array.isArray(expected), path)
    assert.deepEqual(
      Object.keys(actual).sort(),
      Object.keys(expected).sort(),
      path,
    )
    for (const key of Object.keys(expected))
      check(actual[key], expected[key], `${path}.${key}`)
  } else if (typeof expected === 'string') {
    if (expected.trim()) assert.ok(actual.trim(), path)
    else assert.equal(actual, expected, path)
    if (
      metadata.has(path.split('.').at(-1)) ||
      expected.startsWith('/static/')
    ) {
      assert.equal(actual, expected, path)
    }
    if (expected.includes('<')) {
      assert.deepEqual(
        actual.match(/<[^>]+>/g),
        expected.match(/<[^>]+>/g),
        path,
      )
    }
  }
}

test('13개 로케일의 키·제품 식별자·링크·HTML 구조 유지', () => {
  assert.equal(LOCALE_OPTIONS.length, 13)
  assert.equal(new Set(LOCALE_OPTIONS.map(({ value }) => value)).size, 13)
  for (const { value } of LOCALE_OPTIONS) {
    // 기존 한국어 자료의 문구·HTML은 번역 기준인 영어 자료와 별도로 유지한다.
    if (value === 'ko') continue
    check(read(value), base, value)
  }
})

test('추가 언어의 주요 화면 문구와 제품 사양 번역 누락 방지', () => {
  for (const { value } of LOCALE_OPTIONS.filter(
    ({ value }) => !['ko', 'en'].includes(value),
  )) {
    const locale = read(value)
    assert.notEqual(locale.pnf, base.pnf, value)
    assert.notEqual(locale.product.manual, base.product.manual, value)
    assert.notEqual(locale.main.top[0].title, base.main.top[0].title, value)
    assert.notEqual(
      locale.product.list[0].name,
      base.product.list[0].name,
      value,
    )
    assert.notEqual(locale.languageLoadError, base.languageLoadError, value)
  }
})
