import { paginate, getTotalPages, clampPage } from '../../utils/pagination';

describe('pagination utils', () => {
  const items = Array.from({ length: 95 }, (_, i) => i + 1);

  test('paginate first page size 10', () => {
    expect(paginate(items, 1, 10)).toEqual(items.slice(0, 10));
  });

  test('paginate middle page', () => {
    expect(paginate(items, 5, 10)).toEqual(items.slice(40, 50));
  });

  test('paginate last partial page', () => {
    const last = paginate(items, 10, 10); // page 10 should have 5 items (91-95)
    expect(last).toEqual(items.slice(90, 100));
  });

  test('getTotalPages', () => {
    expect(getTotalPages(95, 10)).toBe(10);
    expect(getTotalPages(0, 10)).toBe(1);
    expect(getTotalPages(100, 'all')).toBe(1);
  });

  test('clampPage', () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(6, 5)).toBe(5);
    expect(clampPage(3, 5)).toBe(3);
  });
});
