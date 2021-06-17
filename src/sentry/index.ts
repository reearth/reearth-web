import { ApolloError } from "@apollo/client";
import * as Sentry from "@sentry/browser";

export const initializeSentry = () => {
  const sentryDSN = window.REEARTH_CONFIG?.sentryDsn;
  if (sentryDSN) {
    Sentry.init({
      dsn: sentryDSN,
    });
  }
};

export const reportError = (error: ApolloError) => {
  Sentry.captureException(new Error(error.message));
};

export default {
  reportError,
};
