export const isAppPath = (path) =>
  /^\/(?:company|location|404|product(?:\/[a-z0-9_-]+){0,2}|support(?:\/[a-z0-9_-]+)?)\/*$/i.test(
    path,
  )

export const normalizeEntryUrl = () => {
  const { pathname, search, hash } = window.location
  if (hash.startsWith('#/') && !hash.startsWith('#//')) {
    const target = new URL(hash.slice(1), 'https://local.invalid')
    const params = new URLSearchParams(search)
    for (const [key, value] of target.searchParams) params.append(key, value)
    const query = params.size ? `?${params}` : ''
    window.history.replaceState(
      null,
      '',
      `${target.pathname.replace(/\/+$/, '') || '/'}${query}${target.hash}`,
    )
  } else if (isAppPath(pathname) && pathname.endsWith('/')) {
    window.history.replaceState(
      null,
      '',
      `${pathname.replace(/\/+$/, '')}${search}${hash}`,
    )
  }
}
