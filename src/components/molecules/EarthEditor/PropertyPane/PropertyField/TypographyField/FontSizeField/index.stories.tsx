import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";

import FontSizeField from ".";

// NEED TO UPDATE THESE 2021/4/28
storiesOf("molecules/EarthEditor/PropertyPane/PropertyField/TypographyField/FontSizeField", module)
  .add("default", () => <FontSizeField onChange={action("onchange")} />)
  .add("linked", () => <FontSizeField onChange={action("onchange")} />)
  .add("overridden", () => <FontSizeField onChange={action("onchange")} />)
  .add("disabled", () => <FontSizeField onChange={action("onchange")} />)
  .add("linked & disabled", () => <FontSizeField onChange={action("onchange")} />)
  .add("overridden & disabled", () => <FontSizeField onChange={action("onchange")} />)
  .add("linked & overridden", () => <FontSizeField onChange={action("onchange")} />)
  .add("linekd & overridden & disabled", () => <FontSizeField onChange={action("onchange")} />);
