export function imageUrl(src) {
  if (!src) return '';
  if (src.startsWith('/uploads/')) return src;
  return src;
}