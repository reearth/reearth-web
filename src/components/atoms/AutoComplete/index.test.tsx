import { render } from "@testing-library/react";
import { text } from "node:stream/consumers";
import React from "react";

import SelectInput from "./index";

const sampleItems: { value: string; label: string }[] = [
  {
    value: "hoge",
    label: "hoge",
  },
  {
    value: "fuga",
    label: "fuga",
  },
];

test("component should be renered", () => {
  render(<SelectInput />);
});

test("component should render items", () => {
  render(<SelectInput items={sampleItems} />);
});
