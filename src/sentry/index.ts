import * as Sentry from "@sentry/browser";

export const initialize = () => {
  const { sentryDSN, sentryEnv } = window.REEARTH_CONFIG ?? {};
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
