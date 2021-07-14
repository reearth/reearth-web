import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { MockedProvider as MockedGqlProvider, MockedResponse } from "@apollo/client/testing";

import { USER_DATA } from "../gql/queries";
import { Provider as IntlProvider } from "../locale";
import { Provider as ThemeProvider } from "../theme";

export * from "@testing-library/react";

const queryMocks: readonly MockedResponse<Record<string, any>>[] | undefined = [
  {
    request: {
      query: USER_DATA,
      variables: {},
    },
    result: {
      data: {
        me: {
          id: "whatever",
          lang: "en",
          theme: "dark",
          __typename: "User",
        },
      },
    },
  },
];

export const render = (ui: React.ReactElement, { ...renderOptions } = {}) => {
  const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
    return (
      <MockedGqlProvider mocks={queryMocks} addTypename={false}>
        <ThemeProvider>
          <IntlProvider>{children}</IntlProvider>
        </ThemeProvider>
      </MockedGqlProvider>
    );
  };
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};
