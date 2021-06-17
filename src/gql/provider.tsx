import React from "react";
import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { createUploadLink } from "apollo-upload-client";
import { useAuth0 } from "@auth0/auth0-react";

import { store, localSlice } from "@reearth/state";
import fragmentMatcher from "./fragmentMatcher.json";
import { SentryLink } from "apollo-link-sentry";

const Provider: React.FC = ({ children }) => {
  const endpoint = window.REEARTH_CONFIG?.api
    ? `${window.REEARTH_CONFIG.api}/graphql`
    : "/api/graphql";
  const { getAccessTokenSilently } = useAuth0();

  const authLink = setContext(async (_, { headers }) => {
    // get the authentication token from local storage if it exists
    const accessToken = window.REEARTH_E2E_ACCESS_TOKEN || (await getAccessTokenSilently());
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    };
  });

  const uploadLink = createUploadLink({
    uri: endpoint,
  });

  const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (!networkError && !graphQLErrors) return;
    const error = networkError?.message ?? graphQLErrors?.map(e => e.message).join(", ");
    store.dispatch(localSlice.actions.set({ error }));
  });

  const sentryLink = new SentryLink({ uri: endpoint });

  const cache = new InMemoryCache({
    possibleTypes: fragmentMatcher.possibleTypes,
    typePolicies: {
      LayerGroup: {
        fields: {
          layers: {
            merge: false,
          },
        },
      },
    },
  });

  // const testLink = new ApolloLink((operation, forward) => {
  //   return forward(operation).map(res => {
  //     res.data = { error: "error!!!!" };
  //     return res;
  //   });
  // });

  const client = new ApolloClient({
    uri: endpoint,
    link: ApolloLink.from([sentryLink, errorLink, authLink, uploadLink]),
    cache,
    connectToDevTools: process.env.NODE_ENV === "development",
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
