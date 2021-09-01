import React, { useEffect } from "react";

import { Provider as DndProvider } from "@reearth/util/use-dnd";
import { withAuthenticationRequired, AuthenticationRequiredPage } from "@reearth/auth";
import { useSceneId } from "@reearth/state";
import CanvasArea from "@reearth/components/organisms/EarthEditor/CanvasArea";
import { PublishedAppProvider as ThemeProvider } from "../../../theme";

export type Props = {
  path?: string;
  sceneId?: string;
};

const PreviewPage: React.FC<Props> = ({ sceneId }) => {
  const [sceneId2, setSceneId] = useSceneId();

  useEffect(() => {
    setSceneId(sceneId);
  }, [sceneId, setSceneId]);

  return sceneId2 ? (
    <ThemeProvider>
      <DndProvider>
        <AuthenticationRequiredPage>
          <CanvasArea isBuilt />
        </AuthenticationRequiredPage>
      </DndProvider>
    </ThemeProvider>
  ) : null;
};

export default withAuthenticationRequired(PreviewPage);
