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
      } catch (error) {
        if (!(error instanceof URIError)) throw error
        return encodeURIComponent(value)
      }
    }
    Object.keys(request.querystring || {}).forEach((key) => {
      const entry = request.querystring[key]
      const values = entry.multiValue || [entry]
      values.forEach((item) => {
        query.push(`${encode(key)}=${encode(item.value)}`)
      })
    })
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
