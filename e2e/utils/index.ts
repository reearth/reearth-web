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

export async function initUser(token?: string): Promise<{
  token: string;
  userId: string;
  teamId: string;
  userName: string;
}> {
  const { userName, userId, teamId, api, signUpSecret } = config;
  console.log(
    "initUser: config: ",
    JSON.stringify({
      userName,
      userId,
      teamId,
      api,
      signUpSecret: signUpSecret ? "***" : "",
    }),
  );

  if (!userName || !userId || !teamId || !api) {
    throw new Error(`either userName, userId, teamId and api are missing`);
  }

  token = token || (await login());

  const resp = await fetch(api + "/api/graphql", {
    method: "POST",
    body: JSON.stringify({
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
    }),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const body = await resp.json();
  if (!resp.ok || body.error || body.errors) {
    throw new Error(`failed to init an user: ${JSON.stringify(body)}`);
  }

  return {
    token,
    userName,
    userId,
    teamId,
  };
}

export async function login(): Promise<string> {
  const { authUrl, userName, password, authAudience, authClientId } = config;
  console.log(
    "login: config: ",
    JSON.stringify({
      authUrl,
      userName,
      password: password ? "***" : "",
      authAudience,
      authClientId,
    }),
  );

  if (!authUrl || !userName || !password || !authAudience || !authClientId) {
    throw new Error(
      "either authUrl, userName, password, authAudience and authClientId are missing",
    );
  }

  const resp = await fetch(`${oauthDomain(authUrl)}/oauth/token`, {
    method: "POST",
    body: JSON.stringify({
      username: userName,
      password,
      audience: authAudience,
      client_id: authClientId,
      grant_type: "password",
      scope: "openid profile email",
    }),
  });

  const body = (await resp.json()) as { access_token?: string };
  if (!body.access_token) {
    throw new Error(`access token is missing: ${JSON.stringify(body)}`);
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
