function handler(event) {
  const request = event.request
  const path = request.uri
  const isAppPath =
    /^\/(?:company|location|404|product(?:\/[a-z0-9_-]+){0,2}|support(?:\/[a-z0-9_-]+)?)\/*$/i.test(
      path,
    )
  if (isAppPath) {
    const query = []
    const encode = (value) => {
      try {
        return encodeURIComponent(decodeURIComponent(value.replace(/\+/g, ' ')))
      } catch {
        return encodeURIComponent(value)
      }
    }
    for (const key of Object.keys(request.querystring || {})) {
      const entry = request.querystring[key]
      const values = entry.multiValue || [entry]
      for (const item of values)
        query.push(`${encode(key)}=${encode(item.value)}`)
    }
    const search = query.length ? `?${query.join('&')}` : ''
    return {
      statusCode: 302,
      statusDescription: 'Found',
      headers: {
        location: { value: `/${search}#${path.replace(/\/+$/, '')}` },
        'cache-control': { value: 'no-store' },
      },
    }
  }
  if (path === '/') request.uri = '/index.html'
  return request
}
