export type AdjustmentOperation = 'IN' | 'OUT';

export function computeAdjustedQuantity(
  currentQuantity: number,
  operation: AdjustmentOperation,
  amount: number,
): number {
  const delta = operation === 'IN' ? amount : -amount;
  return currentQuantity + delta;
}

export function isNegativeQuantity(quantity: number): boolean {
  return quantity < 0;
}
