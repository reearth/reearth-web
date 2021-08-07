import React from "react";
import { Provider as DndProvider } from "@reearth/util/use-dnd";

import Published from "@reearth/components/organisms/Published";

const PublishedPage: React.FC<{
  path?: string;
  default?: boolean;
  alias?: string;
}> = ({ alias }) => {
  return (
    <DndProvider>
      <Published alias={alias} />
    </DndProvider>
  );
};

export default PublishedPage;
