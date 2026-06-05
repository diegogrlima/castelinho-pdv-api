export function computeItemSubtotal(
  quantity: number,
  unitPrice: number,
): number {
  return Number((quantity * unitPrice).toFixed(2));
}

export function computeSaleTotal(items: { subtotal: number }[]): number {
  return Number(
    items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2),
  );
}

export function generateSaleCode(): string {
  const suffix = Date.now().toString(36).toUpperCase();
  return `VND-${suffix}`;
}
