import { readdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'

const root = 'public/static/images'
let before = 0
let after = 0
let count = 0
const optimize = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) await optimize(path)
    else if (/\.(png|jpg)$/i.test(path)) {
      const output = path.replace(/\.(png|jpg)$/i, '.webp')
      await sharp(path).webp({ quality: 82, effort: 6 }).toFile(output)
      before += (await stat(path)).size
      after += (await stat(output)).size
      count++
    }
  }
}
await optimize(root)
console.log(
  JSON.stringify({
    count,
    before,
    after,
    savedPercent: Math.round((1 - after / before) * 100),
  }),
)
