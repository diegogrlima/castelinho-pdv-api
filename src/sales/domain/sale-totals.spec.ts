import {
  computeItemSubtotal,
  computeSaleTotal,
  generateSaleCode,
} from '@sales/domain/sale-totals';

describe('sale totals domain', () => {
  it('computes item subtotal with two decimal places', () => {
    expect(computeItemSubtotal(2, 29.9)).toBe(59.8);
    expect(computeItemSubtotal(3, 10.555)).toBe(31.66);
  });

  it('computes sale total from item subtotals', () => {
    expect(
      computeSaleTotal([{ subtotal: 10 }, { subtotal: 25.5 }]),
    ).toBe(35.5);
  });

  it('generates sale code with VND prefix', () => {
    expect(generateSaleCode()).toMatch(/^VND-[A-Z0-9]+$/);
  });
});
