// Utilidades de paginación simples y puras
// paginate: devuelve subconjunto de elementos para una página dada
// getTotalPages: calcula total de páginas dado un tamaño de página

export function paginate(items, page, pageSize) {
  if (!Array.isArray(items)) return [];
  if (pageSize === 'all') return items;
  const size = parseInt(pageSize, 10);
  if (!size || size <= 0) return items;
  const current = Math.max(1, parseInt(page, 10) || 1);
  const start = (current - 1) * size;
  return items.slice(start, start + size);
}

export function getTotalPages(totalItems, pageSize) {
  if (pageSize === 'all') return 1;
  const size = parseInt(pageSize, 10);
  if (!size || size <= 0) return 1;
  return Math.max(1, Math.ceil(totalItems / size));
}

export function clampPage(page, totalPages) {
  if (!totalPages) return 1;
  return Math.min(Math.max(1, page), totalPages);
}
