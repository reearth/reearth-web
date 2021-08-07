import React from "react";
import { EditorModeContextProvider } from "reearth-realign";
import { withAuthenticationRequired } from "@auth0/auth0-react";

import AuthenticationRequiredPage from "@reearth/components/pages/Common/AuthenticationRequiredPage";
import EarthEditorPage from "@reearth/components/molecules/EarthEditor/EarthEditorPage";
import CanvasArea from "@reearth/components/organisms/EarthEditor/CanvasArea";
import Header from "@reearth/components/organisms/EarthEditor/Header";
import LeftMenu from "@reearth/components/organisms/EarthEditor/LeftMenu";
import RightMenu from "@reearth/components/organisms/EarthEditor/RightMenu";
import PrimitiveHeader from "@reearth/components/organisms/EarthEditor/PrimitiveHeader";
import useHooks from "./hooks";

export type Props = {
  path?: string;
  sceneId?: string;
};

const EarthEditor: React.FC<Props> = ({ sceneId }) => {
  const { loading, loaded } = useHooks(sceneId);

  return (
    <AuthenticationRequiredPage>
      <EditorModeContextProvider>
        <EarthEditorPage
          loading={loading}
          loaded={loaded}
          header={<Header />}
          left={<LeftMenu />}
          centerTop={<PrimitiveHeader />}
          center={<CanvasArea />}
          right={<RightMenu />}
        />
      </EditorModeContextProvider>
    </AuthenticationRequiredPage>
  );
};

export default withAuthenticationRequired(EarthEditor);
