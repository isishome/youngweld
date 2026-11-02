import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { readFileSync } from 'node:fs'
import { LOCALE_OPTIONS } from '../../src/locales/registry.js'

const chooseLanguage = async (page, label, mobile) => {
  if (mobile) {
    await page.getByTestId('navigation-menu').click()
    await page.getByRole('combobox').click()
  } else {
    await page.getByTestId('language-menu').click()
  }
  await page.getByText(label, { exact: true }).last().click()
}

test('목록의 이미지·제품명으로 제품 선택 및 방문 기록 복원', async ({
  page,
}) => {
  await page.goto('/product/control')
  await expect(page.locator('.product.marker')).toHaveCount(0)
  const imageLink = page.locator('#YM001 .img-wrap')
  await imageLink.scrollIntoViewIfNeeded()
  const beforeImageClick = await page.evaluate(() => window.scrollY)
  await imageLink.click()
  await expect(page).toHaveURL(/\/product\/control\/YM001$/)
  await expect(page.locator('#YM001')).toHaveAttribute('aria-current', 'true')
  await expect(page.locator('.product.marker')).toHaveCount(1)
  // 기존 smooth 스크롤이 뒤늦게 실행되는 경우도 검출한다.
  await page.waitForTimeout(700)
  expect(
    Math.abs((await page.evaluate(() => window.scrollY)) - beforeImageClick),
  ).toBeLessThanOrEqual(2)
  const next = page.locator('#YM002 .product-link.product-name')
  await next.focus()
  const beforeNameClick = await page.evaluate(() => window.scrollY)
  await next.press('Enter')
  await expect(page).toHaveURL(/\/product\/control\/YM002$/)
  await expect(page.locator('#YM002')).toHaveAttribute('aria-current', 'true')
  await expect(page.locator('#YM001')).not.toHaveAttribute('aria-current')
  await page.waitForTimeout(700)
  expect(
    Math.abs((await page.evaluate(() => window.scrollY)) - beforeNameClick),
  ).toBeLessThanOrEqual(2)
  await page.goBack()
  await expect(page.locator('#YM001')).toHaveAttribute('aria-current', 'true')
  await page.reload()
  await expect(page.locator('#YM001')).toHaveAttribute('aria-current', 'true')
  await expect(page.locator('#YM001 a.manual')).toHaveAttribute(
    'href',
    /\.pdf$/,
  )
})

for (const option of LOCALE_OPTIONS) {
  test(`언어 전환·저장·주요 화면: ${option.value}`, async ({
    page,
  }, testInfo) => {
    const locale = JSON.parse(
      readFileSync(`src/locales/${option.value}.json`, 'utf8'),
    )
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto('/product/control/YM001')
    if (option.value !== 'ko')
      await chooseLanguage(
        page,
        option.label,
        testInfo.project.name === 'mobile',
      )
    await expect(page.locator('html')).toHaveAttribute('lang', option.language)
    await expect(page.locator('#YM001 .manual')).toHaveText(
      locale.product.manual,
    )
    await page.reload()
    await expect(page.locator('html')).toHaveAttribute('lang', option.language)
    for (const path of ['/', '/company', '/support', '/location']) {
      await page.goto(path, { waitUntil: 'domcontentloaded' })
      await expect(page.locator('main')).toBeVisible()
      await expect(page.locator('html')).toHaveAttribute(
        'lang',
        option.language,
      )
      if (path === '/') {
        await expect(page.locator('.top .title').first()).toHaveText(
          locale.main.top[0].title,
        )
        for (const hero of await page.locator('.top').all()) {
          expect(
            await hero.evaluate((el) => el.scrollHeight <= el.clientHeight + 2),
          ).toBe(true)
        }
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true)
      expect(await page.locator('a[href^="/#/"]').count()).toBe(0)
    }
    expect(errors).toEqual([])
    if (['de', 'ru', 'zh-TW'].includes(option.value)) {
      await page.screenshot({
        path: testInfo.outputPath(`locale-${option.value}.png`),
        fullPage: true,
      })
    }
  })
}

test('언어 파일 로딩 실패 시 기존 언어와 쿠키 유지', async ({
  page,
  context,
}, testInfo) => {
  await page.goto('/')
  await page.route(/\/assets\/fr-[^/]+\.js$/, (route) => route.abort())
  await chooseLanguage(page, 'Français', testInfo.project.name === 'mobile')
  await expect(page.getByRole('alert')).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko-KR')
  expect(
    (await context.cookies()).find(({ name }) => name === 'youngweld.lang'),
  ).toBeUndefined()
})

test('path 링크·쿼리·브라우저 앞뒤 이동과 이전 북마크 정규화', async ({
  page,
}) => {
  await page.goto('/?tag=a&tag=b#/company/?from=bookmark')
  await expect(page).toHaveURL('/company?tag=a&tag=b&from=bookmark')
  await page.goto('/')
  await page.locator('.detail').first().click()
  await expect(page).toHaveURL(/\/product\/submerged\/YESAWCG-001$/)
  await page.goBack()
  await expect(page).toHaveURL('/')
  await page.goForward()
  await expect(page).toHaveURL(/\/product\/submerged\/YESAWCG-001$/)
})

test('홈에서만 이미지 preload하며 내부 이동·복귀 시 중복되지 않음', async ({
  page,
}) => {
  const imageRequests = []
  page.on('request', (request) => {
    if (request.url().includes('/yesawcg001.webp'))
      imageRequests.push(request.url())
  })
  const preloads = page.locator('link[rel="preload"][as="image"]')
  await page.goto('/support/')
  await expect(page.locator('.q-tree')).toBeVisible()
  await expect(preloads).toHaveCount(0)
  expect(imageRequests).toEqual([])
  await page.goto('/')
  await expect(preloads).toHaveCount(1)
  await expect(preloads).toHaveAttribute('href', /yesawcg001.webp$/)
  const image = page.locator('.product-wrap img').first()
  await expect(image).toHaveAttribute('loading', 'eager')
  await expect(image).toHaveAttribute('fetchpriority', 'high')
  await expect
    .poll(() => image.evaluate((img) => img.complete && img.naturalWidth > 0))
    .toBe(true)
  await page.locator('.detail').first().click()
  await expect(page).toHaveURL(/\/product\//)
  await expect(preloads).toHaveCount(0)
  await page.goBack()
  await expect(page.locator('.top')).toHaveCount(2)
  await expect(preloads).toHaveCount(1)
})

test('홈 이미지·접근성·CSP·아이콘', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.addInitScript(() => {
    window.cspViolations = []
    document.addEventListener('securitypolicyviolation', (event) =>
      window.cspViolations.push(
        `${event.violatedDirective}: ${event.blockedURI}`,
      ),
    )
  })
  await page.goto('/')
  await expect(page.locator('.top')).toHaveCount(2)
  await expect(page.locator('.top img').first()).toBeVisible()
  await expect(page.locator('.top img').first()).toHaveCSS(
    'animation-name',
    'zoomIn',
  )
  await page.locator('.product-wrap').first().scrollIntoViewIfNeeded()
  await expect
    .poll(() =>
      page
        .locator('.product-wrap img')
        .first()
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true)
  const nextProduct = page.locator('.product-wrap img').nth(1)
  await nextProduct.scrollIntoViewIfNeeded()
  await expect(nextProduct).toHaveCSS('animation-name', 'slideInUp')
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze()
  expect(results.violations).toEqual([])
  expect(await page.evaluate(() => window.cspViolations)).toEqual([])
  expect(errors).toEqual([])
  await page.screenshot({
    path: test.info().outputPath('home.png'),
    fullPage: true,
  })
})

test('슬래시 경로·상세·새로고침·매뉴얼·404', async ({ page, request }) => {
  for (const path of [
    '/company',
    '/company/',
    '/support/',
    '/location/',
    '/product/submerged/YESAWCG-001/',
  ]) {
    await page.goto(path)
    await expect(page).toHaveURL(new RegExp(`${path.replace(/\/$/, '')}$`))
    await expect(page.locator('main')).toBeVisible()
    await page.reload()
    await expect(page.locator('main')).toBeVisible()
  }
  await expect(page.locator('#YESAWCG-001')).toBeVisible()
  const manual = page.locator('#YESAWCG-001 a.manual')
  await expect(manual).toHaveAttribute('href', /\.pdf$/)
  const response = await request.get(await manual.getAttribute('href'))
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/pdf')
  expect(response.headers()['content-disposition']).toBe('inline')
  expect(response.headers()['cache-control']).toBe(
    'no-cache,max-age=0,must-revalidate',
  )
  await expect(manual).not.toHaveAttribute('download')
  expect((await request.get('/missing.js')).status()).toBe(404)
  await page.goto('/#/not-a-page')
  await expect(page).toHaveURL(/\/404$/)
})

test('스크롤 시 헤더·서브헤더의 라이트/다크 배경과 blur 유지', async ({
  page,
}) => {
  await page.goto('/product/')
  await expect(page.locator('.product').first()).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 900))
  const headers = page.locator('.f--header.scroll-move')
  await expect(headers).toHaveCount(2)
  for (const dark of [false, true]) {
    await page.getByRole('switch', { name: '어두운 화면' }).setChecked(dark)
    for (const header of await headers.all()) {
      await expect(header).toHaveCSS(
        'background-color',
        dark ? 'rgba(30, 30, 30, 0.97)' : 'rgba(250, 250, 250, 0.97)',
      )
      await expect(header).toHaveCSS(
        'backdrop-filter',
        'saturate(2) blur(20px)',
      )
    }
    await page.screenshot({
      path: test.info().outputPath(`headers-${dark ? 'dark' : 'light'}.png`),
    })
  }
})

test('지원하지 않는 언어·테마·언어 저장', async ({
  page,
  context,
}, testInfo) => {
  await context.addCookies([
    { name: 'youngweld.lang', value: 'xx', domain: '127.0.0.1', path: '/' },
  ])
  await page.goto('/')
  await expect(page.locator('.top')).toHaveCount(2)
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko-KR')
  const toggle = page.getByRole('switch', { name: '어두운 화면' })
  await toggle.click()
  const dark = await toggle.getAttribute('aria-checked')
  await page.reload()
  await expect(toggle).toHaveAttribute('aria-checked', dark)
  if (testInfo.project.name === 'mobile') {
    await page.getByRole('button', { name: '메뉴 열기' }).click()
    await page.getByRole('combobox').click()
  } else {
    await page.getByRole('button', { name: '언어' }).click()
  }
  await page.getByText('English', { exact: true }).last().click()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-US')
})

test('지원 검색·지도 프레임·정적 자산', async ({ page, request }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/support/control/')
  const search = page.locator('input:visible').first()
  await search.fill('no-matching-question-12345')
  await expect(page.locator('.q-tree')).toContainText('없')
  await search.fill('')
  await expect(page.locator('.q-tree__node').first()).toBeVisible()
  await page.goto('/location/')
  await expect(page.getByTitle('오시는길')).toHaveAttribute(
    'src',
    /^https:\/\/www.google.com\/maps\/embed/,
  )
  const manifestResponse = await request.get('/static/favicon/site.webmanifest')
  const manifest = await manifestResponse.json()
  expect((await request.get(manifest.icons[0].src)).status()).toBe(200)
  expect((await request.get('/robots.txt')).status()).toBe(200)
  expect(errors).toEqual([])
})
