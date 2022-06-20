import React, { Suspense } from "react";
import { BrowserRouter as Router, useRoutes, Navigate } from "react-router-dom";

import Loading from "@reearth/components/atoms/Loading";
import NotificationBanner from "@reearth/components/organisms/Notification";
import LoginPage from "@reearth/components/pages/Authentication/LoginPage";
import PasswordResetPage from "@reearth/components/pages/Authentication/PasswordReset";
import SignupPage from "@reearth/components/pages/Authentication/SignupPage";
import NotFound from "@reearth/components/pages/NotFound";
import AccountSettings from "@reearth/components/pages/Settings/Account";
import ProjectSettings from "@reearth/components/pages/Settings/Project";
import DatasetSettings from "@reearth/components/pages/Settings/Project/Dataset";
import PluginSettings from "@reearth/components/pages/Settings/Project/Plugin";
import PublicSettings from "@reearth/components/pages/Settings/Project/Public";
import SettingsProjectList from "@reearth/components/pages/Settings/ProjectList";
import WorkspaceSettings from "@reearth/components/pages/Settings/Workspace";
import AssetSettings from "@reearth/components/pages/Settings/Workspace/Asset";
import WorkspaceList from "@reearth/components/pages/Settings/WorkspaceList";
import { Provider as I18nProvider } from "@reearth/i18n";

import { Provider as Auth0Provider } from "./auth";
import RootPage from "./components/pages/Authentication/RootPage";
import Preview from "./components/pages/Preview";
import { Provider as GqlProvider } from "./gql";
import { Provider as ThemeProvider, styled } from "./theme";

const EarthEditor = React.lazy(() => import("@reearth/components/pages/EarthEditor"));
const Dashboard = React.lazy(() => import("@reearth/components/pages/Dashboard"));
const GraphQLPlayground = React.lazy(() => import("@reearth/components/pages/GraphQLPlayground"));
const PluginEditor = React.lazy(() => import("./components/pages/PluginEditor"));

const enableWhyDidYouRender = false;

if (enableWhyDidYouRender && process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const whyDidYouRender = require("@welldone-software/why-did-you-render");
  whyDidYouRender(React, {
    trackAllPureComponents: true,
  });
}

function AppRoutes() {
  // const Redirect = ({ to }: { to: string }) => {
  //   const { teamId, projectId }: Readonly<Params<string>> = useParams();
  //   return (
  //     <Navigate
  //       to={`${to.replace(":teamId", teamId ?? "").replace(":projectId", projectId ?? "")}`}
  //     />
  //   );
  // };
  const routes = useRoutes([
    { path: "/", element: <RootPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/signup", element: <SignupPage /> },
    { path: "/password-reset", element: <PasswordResetPage /> },
    { path: "/dashboard/:teamId", element: <Dashboard /> },
    { path: "/edit/:sceneId", element: <EarthEditor /> },
    { path: "/edit/:sceneId/preview", element: <Preview /> },
    { path: "/settings", element: <Navigate to="/settings/account" /> },
    { path: "/settings/account", element: <AccountSettings /> },
    { path: "/settings/workspaces", element: <WorkspaceList /> },
    { path: "/settings/workspaces/:teamId", element: <WorkspaceSettings /> },
    { path: "/settings/workspaces/:teamId/projects", element: <SettingsProjectList /> },
    { path: "/settings/workspaces/:teamId/asset", element: <AssetSettings /> },
    { path: "/settings/projects/:projectId", element: <ProjectSettings /> },
    { path: "/settings/projects/:projectId/public", element: <PublicSettings /> },
    { path: "/settings/projects/:projectId/dataset", element: <DatasetSettings /> },
    { path: "/settings/projects/:projectId/plugins", element: <PluginSettings /> },
    { path: "/plugin-editor", element: <PluginEditor /> },
    { path: "/graphql", element: process.env.NODE_ENV !== "production" && <GraphQLPlayground /> },
    // redirections for breaking changs in urls
    // {
    //   path: "/settings/workspace/:teamId",
    //   element: <Redirect to="/settings/workspaces/:teamId" />,
    // },
    // {
    //   path: "/settings/workspace/:teamId/projects",
    //   element: <Redirect to="/settings/workspaces/:teamId/projects" />,
    // },
    // {
    //   path: "/settings/workspace/:teamId/asset",
    //   element: <Redirect to="/settings/workspaces/:teamId/asset" />,
    // },
    // {
    //   path: "/settings/project/:projectId/public",
    //   element: <Redirect to="/settings/projects/:projectId/public" />,
    // },
    // {
    //   path: "/settings/project/:projectId/dataset",
    //   element: <Redirect to="/settings/projects/:projectId/dataset" />,
    // },
    // {
    //   path: "/settings/project/:projectId/plugins",
    //   element: <Redirect to="/settings/projects/:projectId/plugins" />,
    // },
    { path: "*", element: <NotFound /> },
  ]);
  return routes;
}

const App: React.FC = () => {
  return (
    <Auth0Provider>
      <GqlProvider>
        <ThemeProvider>
          <I18nProvider>
            <Suspense fallback={<Loading />}>
              <NotificationBanner />
              <StyledRouter>
                <AppRoutes />
              </StyledRouter>
            </Suspense>
          </I18nProvider>
        </ThemeProvider>
      </GqlProvider>
    </Auth0Provider>
  );
};

const StyledRouter = styled(Router)`
  height: 100%;
`;

export default App;
