import {
  StockLimitViolationCode,
  stockLimitViolationMessage,
  validateStockQuantityLimits,
} from '@stocks/domain/stock-quantity.policy';

describe('validateStockQuantityLimits', () => {
  it('returns null when limits are valid', () => {
    expect(validateStockQuantityLimits(10, 2, 100)).toBeNull();
    expect(validateStockQuantityLimits(10, 0, null)).toBeNull();
  });

  it('detects negative minimum', () => {
    expect(validateStockQuantityLimits(0, -1, 10)).toBe(
      StockLimitViolationCode.MINIMUM_NEGATIVE,
    );
  });

  it('detects quantity above maximum', () => {
    expect(validateStockQuantityLimits(50, 0, 40)).toBe(
      StockLimitViolationCode.QUANTITY_EXCEEDS_MAX,
    );
  });

  it('maps violations to safe messages', () => {
    expect(
      stockLimitViolationMessage(StockLimitViolationCode.MIN_GREATER_THAN_MAX),
    ).toBe('Quantidade mínima não pode ser maior que a máxima');
  });
});
