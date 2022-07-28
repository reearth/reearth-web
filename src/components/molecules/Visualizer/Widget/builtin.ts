import Button from "./Button";
import Menu from "./Menu";
import SplashScreen from "./SplashScreen";
import Storytelling from "./Storytelling";
import Timeline from "./Timeline";

import type { Component } from ".";

export const TIMELINE_BUILTIN_WIDGET_ID = "reearth/timeline";

const builtin: Record<string, Component> = {
  "reearth/menu": Menu,
  "reearth/button": Button,
  "reearth/splashscreen": SplashScreen,
  "reearth/storytelling": Storytelling,
  [TIMELINE_BUILTIN_WIDGET_ID]: Timeline,
};

export default builtin;
