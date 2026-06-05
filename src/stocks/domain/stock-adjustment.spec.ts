import {
  computeAdjustedQuantity,
  isNegativeQuantity,
} from '@stocks/domain/stock-adjustment';

describe('stock adjustment domain', () => {
  it('computes inbound adjustment', () => {
    expect(computeAdjustedQuantity(10, 'IN', 5)).toBe(15);
  });

  it('computes outbound adjustment', () => {
    expect(computeAdjustedQuantity(10, 'OUT', 3)).toBe(7);
  });

  it('detects negative quantity', () => {
    expect(isNegativeQuantity(-1)).toBe(true);
    expect(isNegativeQuantity(0)).toBe(false);
  });
});
