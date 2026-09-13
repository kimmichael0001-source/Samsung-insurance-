/**
 * Minimal logging wrapper. In dev this just forwards to console; the single
 * choke point here is where you'd plug in a real crash/log service (Sentry,
 * Bugsnag, Datadog...) before a production release — call its init in
 * app/_layout.tsx and forward `error`/`warn` below to it.
 */
type LogContext = Record<string, unknown>;

function format(message: string, context?: LogContext): [string, LogContext | undefined] {
  return context ? [message, context] : [message, undefined];
}

export const logger = {
  info(message: string, context?: LogContext) {
    if (__DEV__) console.log('[info]', ...format(message, context));
  },
  warn(message: string, context?: LogContext) {
    console.warn('[warn]', ...format(message, context));
  },
  error(message: string, error?: unknown, context?: LogContext) {
    console.error('[error]', message, error, context ?? '');
  },
};
