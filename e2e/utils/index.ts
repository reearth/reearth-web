import { type APIRequestContext, request, test as base, type Page } from "@playwright/test";

export { expect } from "@playwright/test";

export const config = {
  api: process.env["REEARTH_WEB_API"],
  userId: process.env["REEARTH_WEB_E2E_USER_ID"],
  userName: process.env["REEARTH_WEB_E2E_USERNAME"],
  password: process.env["REEARTH_WEB_E2E_PASSWORD"],
  teamId: process.env["REEARTH_WEB_E2E_TEAM_ID"],
  authAudience: process.env["REEARTH_WEB_AUTH0_AUDIENCE"],
  authClientId: process.env["REEARTH_WEB_AUTH0_CLIENT_ID"],
  authUrl: process.env["REEARTH_WEB_AUTH0_DOMAIN"],
  signUpSecret: process.env["REEARTH_WEB_E2E_SIGNUP_SECRET"],
};

export type Reearth = {
  initUser: () => Promise<{
    token: string;
    userId: string;
    teamId: string;
    userName: string;
  }>;
  login: () => Promise<string>;
  gotoAndLogin: (
    url: string,
    token: string,
    options?: Parameters<Page["goto"]>[1],
  ) => ReturnType<Page["goto"]>;
};

export const test = base.extend<{
  reearth: Reearth;
}>({
  reearth: async ({ page, request }, use) => {
    use({
      initUser: (token?: string) => initUser(token, request),
      login: () => login(request),
      gotoAndLogin: async (url, token, options) => {
        const res = await page.goto(url, options);
        await page.evaluate(`window.REEARTH_E2E_ACCESS_TOKEN = ${JSON.stringify(token)};`);
        return res;
      },
    });
  },
});

export async function initUser(
  token?: string,
  ctx?: APIRequestContext,
): Promise<{
  token: string;
  userId: string;
  teamId: string;
  userName: string;
}> {
  const { userName, userId, teamId, api, signUpSecret } = config;

  if (!userName || !userId || !teamId || !api) {
    throw new Error(
      `either userName, userId, teamId and api are missing: ${JSON.stringify({
        userName,
        userId,
        teamId,
        api,
        signUpSecret: signUpSecret ? "***" : "",
      })}`,
    );
  }

  token = token || (await login());
  ctx = ctx || (await request.newContext());

  const resp = await ctx.post(api + "/graphql", {
    data: {
      query: `mutation($userId: ID!, $teamId: ID!, $lang: Lang, $secret: String) {
        deleteMe(input: { userId: $userId }) { userId }
        signup(input: { lang: $lang, userId: $userId, teamId: $teamId, secret: $secret }) { user { id } }
      }`,
      variables: {
        userId,
        teamId,
        secret: signUpSecret,
        lang: "en",
      },
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await resp.json();
  if (!resp.ok() || body.error || body.errors) {
    throw new Error(
      `failed to init an user: ${JSON.stringify(body)} with ${JSON.stringify({
        userName,
        userId,
        teamId,
        api,
        signUpSecret: signUpSecret ? "***" : "",
      })}`,
    );
  }

  return {
    token,
    userName,
    userId: body.data.signup.user.id,
    teamId,
  };
}

export async function login(ctx?: APIRequestContext): Promise<string> {
  const { authUrl, userName, password, authAudience, authClientId } = config;

  if (!authUrl || !userName || !password || !authAudience || !authClientId) {
    throw new Error(
      `either authUrl, userName, password, authAudience and authClientId are missing: ${JSON.stringify(
        {
          authUrl,
          userName,
          password: password ? "***" : "",
          authAudience,
          authClientId,
        },
      )}`,
    );
  }

  ctx = ctx || (await request.newContext());
  const resp = await ctx.post(`${oauthDomain(authUrl)}/oauth/token`, {
    data: {
      username: userName,
      password,
      audience: authAudience,
      client_id: authClientId,
      grant_type: "password",
      scope: "openid profile email",
    },
  });

  const body = (await resp.json()) as { access_token?: string };
  if (!body.access_token) {
    throw new Error(
      `access token is missing: ${JSON.stringify(body)} with ${JSON.stringify({
        authUrl,
        userName,
        password: password ? "***" : "",
        authAudience,
        authClientId,
      })}`,
    );
  }

  return body.access_token;
}

function oauthDomain(u: string | undefined): string {
  if (!u) return "";
  if (!u.startsWith("https://") && !u.startsWith("http://")) {
    u = "https://" + u;
  }
  return u.endsWith("/") ? u.slice(0, -1) : u;
}
