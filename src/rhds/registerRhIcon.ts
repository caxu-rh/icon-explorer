/**
 * Registers the rh-icon custom element. Call once before rendering any rh-icon nodes.
 */
export async function registerRhIcon(): Promise<void> {
  await import('@rhds/elements/rh-icon/rh-icon');
}
