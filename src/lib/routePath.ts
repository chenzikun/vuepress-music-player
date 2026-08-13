export function pathsMatchRoute(
  pagePath: string | undefined,
  routePath: string | undefined,
  resolvePath: (pathname: string, currentPath?: string) => string
): boolean {
  if (!pagePath || !routePath) return false

  const routeKey = resolvePath(routePath, routePath)
  const pageKey = resolvePath(pagePath, routePath)
  if (pageKey === routeKey) return true

  // VuePress 构建产物里 page.path 可能将 permalink 中的 = 替换为 _
  const normalizeEq = (path: string) => path.replace(/_/g, '=')
  return normalizeEq(pageKey) === normalizeEq(routeKey)
}
