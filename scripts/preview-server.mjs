import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { resolve, extname, sep } from 'node:path'
import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { gzipSync } from 'node:zlib'

const root = resolve('dist')
const handler = runInNewContext(
  `${readFileSync('infra/cloudfront/viewer-request.js', 'utf8')}\nhandler`,
)
const policy = JSON.parse(
  readFileSync('infra/cloudfront/response-headers-policy.json', 'utf8'),
).ResponseHeadersPolicyConfig.SecurityHeadersConfig
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.pdf': 'application/pdf',
  '.ico': 'image/x-icon',
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1')
    const querystring = {}
    for (const key of new Set(url.searchParams.keys())) {
      querystring[key] = {
        multiValue: url.searchParams
          .getAll(key)
          .map((value) => ({ value: encodeURIComponent(value) })),
      }
    }
    const result = handler({ request: { uri: url.pathname, querystring } })
    res.setHeader(
      'Content-Security-Policy',
      policy.ContentSecurityPolicy.ContentSecurityPolicy,
    )
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('Referrer-Policy', policy.ReferrerPolicy.ReferrerPolicy)
    if (result.statusCode) {
      res.writeHead(result.statusCode, {
        Location: result.headers.location.value,
      })
      res.end()
      return
    }
    const file = resolve(root, `.${decodeURIComponent(result.uri)}`)
    if (!file.startsWith(root + sep) || !(await stat(file)).isFile()) {
      res.writeHead(404)
      res.end()
      return
    }
    res.setHeader(
      'Content-Type',
      types[extname(file)] || 'application/octet-stream',
    )
    if (extname(file) === '.pdf')
      res.setHeader('Content-Disposition', 'attachment')
    let cacheControl = 'public,max-age=3600'
    if (result.uri === '/index.html' || extname(file) === '.pdf')
      cacheControl = 'no-cache,max-age=0,must-revalidate'
    else if (result.uri.startsWith('/assets/'))
      cacheControl = 'public,max-age=31536000,immutable'
    else if (result.uri.startsWith('/static/'))
      cacheControl = 'public,max-age=86400'
    res.setHeader('Cache-Control', cacheControl)
    const body = await readFile(file)
    if (
      /\.(html|js|css|json|svg|xml|txt|webmanifest)$/.test(file) &&
      /\bgzip\b/.test(req.headers['accept-encoding'] || '')
    ) {
      res.setHeader('Content-Encoding', 'gzip')
      res.setHeader('Vary', 'Accept-Encoding')
      res.end(gzipSync(body))
    } else res.end(body)
  } catch {
    res.writeHead(404)
    res.end()
  }
}).listen(4173, '127.0.0.1', () =>
  console.log('검증 서버: http://127.0.0.1:4173'),
)
