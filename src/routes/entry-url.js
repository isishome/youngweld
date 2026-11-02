export const isAppPath = (path) =>
  /^\/(?:company|location|404|product(?:\/[a-z0-9_-]+){0,2}|support(?:\/[a-z0-9_-]+)?)\/*$/i.test(
    path,
  )

export const normalizeEntryUrl = () => {
  const { pathname, search, hash } = window.location
  if (isAppPath(pathname)) {
    const target = hash.startsWith('#/')
      ? hash
      : `#${pathname.replace(/\/+$/, '')}`
    window.history.replaceState(null, '', `/${search}${target}`)
  }
}
