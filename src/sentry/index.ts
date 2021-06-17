import * as Sentry from "@sentry/browser";

export const initializeSentry = () => {
  const sentryDSN = window.REEARTH_CONFIG?.sentryDsn;
  const sentryEnv = window.REEARTH_CONFIG?.sentryEnv;
  if (sentryDSN) {
    Sentry.init({
      dsn: sentryDSN,
      environment: sentryEnv,
    });
  }
};

export const reportError = (error: string) => {
  Sentry.captureException(error);
};

export default {
  reportError,
};
