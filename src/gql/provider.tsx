import { ApolloProvider, ApolloClient, ApolloLink, InMemoryCache } from "@apollo/client";
import type { ReadFieldFunction } from "@apollo/client/cache/core/types/common";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { SentryLink } from "apollo-link-sentry";
import { createUploadLink } from "apollo-upload-client";
import React from "react";

import { useAuth } from "@reearth/auth";
import { reportError } from "@reearth/sentry";
import { useError } from "@reearth/state";

import fragmentMatcher from "./fragmentMatcher.json";

const Provider: React.FC = ({ children }) => {
  const endpoint = window.REEARTH_CONFIG?.api
    ? `${window.REEARTH_CONFIG.api}/graphql`
    : "/api/graphql";
  const [, setError] = useError();
  const { getAccessToken } = useAuth();

  const authLink = setContext(async (_, { headers }) => {
    // get the authentication token from local storage if it exists
    const accessToken = window.REEARTH_E2E_ACCESS_TOKEN || (await getAccessToken());
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
    if (error) {
      setError(error);
      reportError(error);
    }
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
      Query: {
        fields: {
          assets: {
            keyArgs: ["sort", "pagination", ["first", "last"]],

            merge(existing, incoming, { readField }) {
              const merged = existing ? existing.edges.slice(0) : [];
              let offset = offsetFromCursor(merged, existing?.pageInfo.endCursor, readField);

              if (offset < 0) offset = merged.length;

              for (let i = 0; i < incoming?.edges?.length; ++i) {
                merged[offset + i] = incoming.edges[i];
              }

              return {
                ...incoming,
                edges: merged,
              };
            },
          },
        },
      },
    },
  });

  function offsetFromCursor(items: any, cursor: string, readField: ReadFieldFunction) {
    if (items.length < 1) return -1;
    for (let i = 0; i <= items.length; ++i) {
      const item = items[i];
      if (readField("cursor", item) === cursor) {
        return i + 1;
      }
    }
    return -1;
  }

  const client = new ApolloClient({
    uri: endpoint,
    link: ApolloLink.from([errorLink, sentryLink, authLink, uploadLink]),
    cache,
    connectToDevTools: process.env.NODE_ENV === "development",
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Provider;
