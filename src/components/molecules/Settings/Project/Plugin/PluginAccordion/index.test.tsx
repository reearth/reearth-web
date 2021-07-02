import { render, screen } from "@reearth/test/utils";
import React from "react";
import PluginAccordion from "./index";

describe("Accordion should display header and body", () => {
  const items = [
    {
      thumbnailUrl: `${process.env.PUBLIC_URL}/sample.svg`,
      title: "Sample",
      isInstalled: true,
      bodyMarkdown: "# Hoge ## Hoge",
      author: "reearth",
    },
    {
      thumbnailUrl: `${process.env.PUBLIC_URL}/sample.svg`,
      title: "Sample2",
      isInstalled: false,
      bodyMarkdown: "# Fuga ## Fuga",
      author: "reearth",
    },
  ];
  test("Accordion should be rendered", () => {
    render(<PluginAccordion items={items} />);
  });
  test("PluginAccordion should display header and not display body", () => {
    render(<PluginAccordion items={items} />);
    expect(screen.getByText("Sample")).toBeInTheDocument();
  });
});
