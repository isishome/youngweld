import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

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
  await expect(page).toHaveURL(/#\/product\//)
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
    await expect(page).toHaveURL(new RegExp(`/#${path.replace(/\/$/, '')}$`))
    await expect(page.locator('main')).toBeVisible()
    await page.reload()
    await expect(page.locator('main')).toBeVisible()
  }
  await expect(page.locator('#YESAWCG-001')).toBeVisible()
  const manual = page.locator('#YESAWCG-001 a.manual')
  await expect(manual).toHaveAttribute('href', /\.pdf\?download=1$/)
  const response = await request.get(await manual.getAttribute('href'))
  expect(response.status()).toBe(200)
  expect(response.headers()['content-type']).toContain('application/pdf')
  expect(response.headers()['content-disposition']).toBe('attachment')
  expect(response.headers()['cache-control']).toBe(
    'no-cache,max-age=0,must-revalidate',
  )
  const downloadEvent = page.waitForEvent('download')
  await manual.click()
  const download = await downloadEvent
  expect(download.suggestedFilename()).toMatch(/\.pdf$/i)
  expect(await download.failure()).toBeNull()
  await expect(page.locator('#YESAWCG-001')).toBeVisible()
  expect((await request.get('/missing.js')).status()).toBe(404)
  await page.goto('/#/not-a-page')
  await expect(page).toHaveURL(/#\/404$/)
})

test('스크롤 시 헤더·서브헤더의 라이트/다크 배경과 blur 유지', async ({
  page,
}) => {
  await page.goto('/product/')
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
    { name: 'youngweld.lang', value: 'ja', domain: '127.0.0.1', path: '/' },
  ])
  await page.goto('/')
  await expect(page.locator('.top')).toHaveCount(2)
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko')
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
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
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
