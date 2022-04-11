// import "./wdyr"; // should be the first import

import React from "react";
import ReactDOM from "react-dom";

import App from "./app";
import loadConfig from "./config";
import { initialize as initializeSentry } from "./sentry";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.React = React;

loadConfig().finally(() => {
  initializeSentry();
  ReactDOM.render(<App />, document.getElementById("root"));
});
