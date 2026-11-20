export function assetUrl<T extends string | null | undefined>(url: T, base: string): T {
  if (!url || !url.startsWith('/') || url.startsWith('//')) return url
  return (base.replace(/\/$/, '') + url) as T
}
