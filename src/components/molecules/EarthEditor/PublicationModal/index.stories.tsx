import { Meta } from "@storybook/react";
import React from "react";

import PublicationModal from ".";

export default {
  title: "molecules/EarthEditor/PublicationModal",
  component: PublicationModal,
} as Meta;

export const Default = () => <PublicationModal isVisible />;
