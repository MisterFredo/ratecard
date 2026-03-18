export function trackEvent(
  eventName: string,
  params?: Record<string, any>
) {
  if (typeof window === "undefined") return;

  const gtag = (window as any).gtag;
  if (!gtag) return;

  gtag("event", eventName, params || {});
}
