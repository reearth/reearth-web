import { Meta, Story } from "@storybook/react";
import React from "react";

import AutoComplete, { Props } from ".";

export default {
  title: "atoms/AutoComplete",
  component: AutoComplete,
} as Meta;

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

const addItem = (value: string) => {
  sampleItems.push({ value, label: value });
};

export const Default: Story<Props<string>> = () => {
  return <AutoComplete items={sampleItems} onCreate={addItem} />;
};
