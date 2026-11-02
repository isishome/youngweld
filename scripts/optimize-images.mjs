import { existsSync } from 'node:fs'
import { glob, readFile, stat } from 'node:fs/promises'
import sharp from 'sharp'

const images = new Set()
let before = 0
let after = 0
let count = 0

for await (const file of glob(['src/**/*.{vue,js,json,css}', 'index.html'])) {
  const content = await readFile(file, 'utf8')
  for (const match of content.matchAll(
    /\/static\/images\/[A-Za-z0-9_/-]+\.webp/g,
  )) {
    images.add(match[0])
  }
}

for (const image of [...images].sort()) {
  const output = `public${image}`
  const stem = output.replace(/\.webp$/, '')
  const source = [`${stem}.png`, `${stem}.jpg`].find(existsSync)
  if (!source) throw new Error(`원본 이미지가 없습니다: ${image}`)
  await sharp(source).webp({ quality: 82, effort: 6 }).toFile(output)
  before += (await stat(source)).size
  after += (await stat(output)).size
  count++
}
console.log(
  JSON.stringify({
    count,
    before,
    after,
    savedPercent: Math.round((1 - after / before) * 100),
  }),
)
