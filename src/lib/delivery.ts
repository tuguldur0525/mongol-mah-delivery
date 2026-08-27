export const FREE_DELIVERY_THRESHOLD = 100_000;

export function getDeliveryFee(subtotal: number, configuredFee: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : configuredFee;
}
