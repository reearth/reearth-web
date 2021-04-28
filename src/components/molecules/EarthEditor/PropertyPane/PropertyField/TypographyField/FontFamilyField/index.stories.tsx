import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import FontFamilyField from ".";

// NEED TO UPDATE THESE 2021/4/28
storiesOf(
  "molecules/EarthEditor/PropertyPane/PropertyField/TypographyField/FontFamilyField",
  module,
)
  .add("default", () => <FontFamilyField onChange={action("onchange")} />)
  .add("linked", () => <FontFamilyField onChange={action("onchange")} />)
  .add("overridden", () => <FontFamilyField onChange={action("onchange")} />)
  .add("disabled", () => <FontFamilyField onChange={action("onchange")} />)
  .add("linked & disabled", () => <FontFamilyField onChange={action("onchange")} />)
  .add("overridden & disabled", () => <FontFamilyField onChange={action("onchange")} />)
  .add("linked & overridden", () => <FontFamilyField onChange={action("onchange")} />)
  .add("linekd & overridden & disabled", () => <FontFamilyField onChange={action("onchange")} />);
