import { computeAvailableQuantity } from '@stocks/domain/stock-availability';

describe('stock availability domain', () => {
  it('computes available quantity subtracting reserved', () => {
    expect(computeAvailableQuantity(10, 3)).toBe(7);
    expect(computeAvailableQuantity(5, 5)).toBe(0);
  });
});
