import React from "react";
import { render } from "@reearth/test/utils";

import PluginSection from "./index";

const samplePlugins = [
  {
    thumbnailUrl: "https://static.dev.reearth.io/assets/01ep431qsvnjndxhan3gwqd1rj.png",
    title: "Storytelling",
    isInstalled: true,
    bodyMarkdown: "# Hoge",
    author: "reearth",
  },
  {
    thumbnailUrl: "https://static.dev.reearth.io/assets/01ep431qsvnjndxhan3gwqd1rj.png",
    title: "Splashscreen",
    isInstalled: true,
    bodyMarkdown: "# Fuga",
    author: "reearth",
  },
];

test("plugin section should display plugins", () => {
  render(<PluginSection plugins={samplePlugins} />);
  // TODO: after plug-ins have been developed uncomment here
  // expect(screen.getByText(/Storytelling/)).toBeInTheDocument();
  // expect(screen.getByText(/Hoge/)).toBeInTheDocument();
});
