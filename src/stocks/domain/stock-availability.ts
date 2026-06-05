export function computeAvailableQuantity(
  quantity: number,
  reservedQuantity: number,
): number {
  return quantity - reservedQuantity;
}
