/**
 * Analytics facade — a single choke point for product events. Right now
 * `track()` only logs in dev; wire a real provider (PostHog, Amplitude,
 * Firebase Analytics, Segment...) by replacing the body of `track` with that
 * SDK's call. Call sites don't need to change when you do.
 */
type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export function track(event: string, properties?: AnalyticsProperties) {
  if (__DEV__) {
    console.log('[analytics]', event, properties ?? {});
  }
  // TODO(production): forward to a real provider, e.g.:
  //   posthog.capture(event, properties);
}

export const AnalyticsEvents = {
  VIEW_PRODUCT: 'view_product',
  ADD_TO_CART: 'add_to_cart',
  BEGIN_CHECKOUT: 'begin_checkout',
  PURCHASE: 'purchase',
} as const;
