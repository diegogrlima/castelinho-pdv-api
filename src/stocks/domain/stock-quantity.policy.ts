export const StockLimitViolationCode = {
  MINIMUM_NEGATIVE: 'MINIMUM_NEGATIVE',
  MAXIMUM_NEGATIVE: 'MAXIMUM_NEGATIVE',
  MIN_GREATER_THAN_MAX: 'MIN_GREATER_THAN_MAX',
  QUANTITY_EXCEEDS_MAX: 'QUANTITY_EXCEEDS_MAX',
} as const;

export type StockLimitViolationCodeValue =
  (typeof StockLimitViolationCode)[keyof typeof StockLimitViolationCode];

export function validateStockQuantityLimits(
  quantity: number,
  minimumQuantity: number,
  maximumQuantity?: number | null,
): StockLimitViolationCodeValue | null {
  if (minimumQuantity < 0) {
    return StockLimitViolationCode.MINIMUM_NEGATIVE;
  }

  if (maximumQuantity !== undefined && maximumQuantity !== null) {
    if (maximumQuantity < 0) {
      return StockLimitViolationCode.MAXIMUM_NEGATIVE;
    }
    if (minimumQuantity > maximumQuantity) {
      return StockLimitViolationCode.MIN_GREATER_THAN_MAX;
    }
    if (quantity > maximumQuantity) {
      return StockLimitViolationCode.QUANTITY_EXCEEDS_MAX;
    }
  }

  return null;
}

export function stockLimitViolationMessage(
  code: StockLimitViolationCodeValue,
): string {
  const messages: Record<StockLimitViolationCodeValue, string> = {
    [StockLimitViolationCode.MINIMUM_NEGATIVE]:
      'Quantidade mínima não pode ser negativa',
    [StockLimitViolationCode.MAXIMUM_NEGATIVE]:
      'Quantidade máxima não pode ser negativa',
    [StockLimitViolationCode.MIN_GREATER_THAN_MAX]:
      'Quantidade mínima não pode ser maior que a máxima',
    [StockLimitViolationCode.QUANTITY_EXCEEDS_MAX]:
      'Quantidade excede o limite máximo de estoque',
  };

  return messages[code];
}
