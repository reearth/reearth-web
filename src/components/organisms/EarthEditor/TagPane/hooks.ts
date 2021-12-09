import { useMemo } from "react";

import { useAuth } from "@reearth/auth";
import { useGetSceneTagsQuery } from "@reearth/gql";
import { useSceneId } from "@reearth/state";

export default ({}: {}) => {
  const { isAuthenticated } = useAuth();
  const [sceneId] = useSceneId();
  const { loading, data: sceneData } = useGetSceneTagsQuery({
    variables: { sceneId: sceneId || "" },
    skip: !isAuthenticated || !sceneId,
  });
  const sceneTags = useMemo(() => {
    return sceneData?.node?.__typename === "Scene" ? sceneData.node.tags : undefined;
  }, [sceneData?.node]);
  console.log(sceneTags);
  return { loading };
};
