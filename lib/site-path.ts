const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ""

export function withBasePath(path: string) {
  if (!basePath) return path
  if (path.startsWith("/")) return `${basePath}${path}`
  return `${basePath}/${path}`
}

export function siteAsset(path: string) {
  return withBasePath(path)
}
