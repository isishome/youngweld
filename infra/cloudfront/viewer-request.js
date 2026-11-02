function handler(event) {
  const request = event.request
  const path = request.uri
  const isAppPath =
    /^\/(?:company|location|404|product(?:\/[a-z0-9_-]+){0,2}|support(?:\/[a-z0-9_-]+)?)\/*$/i.test(
      path,
    )
  if (path === '/' || isAppPath) request.uri = '/index.html'
  return request
}
