import * as Sentry from "@sentry/nextjs";
import {
  getSampleRate,
  getSentryEnvironment,
  getSentryRelease,
  isSentryEnabled,
  sanitizeSentryEvent,
} from "./sentry.shared";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: isSentryEnabled(),
  environment: getSentryEnvironment(),
  release: getSentryRelease(),
  sendDefaultPii: false,
  tracesSampleRate: getSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    process.env.NODE_ENV === "production" ? 0.02 : 0.2,
  ),
  beforeSend: sanitizeSentryEvent,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: getSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_REPLAYS_SESSION_SAMPLE_RATE,
    0,
  ),
  replaysOnErrorSampleRate: getSampleRate(
    process.env.NEXT_PUBLIC_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE,
    process.env.NODE_ENV === "production" ? 0.1 : 1,
  ),
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
