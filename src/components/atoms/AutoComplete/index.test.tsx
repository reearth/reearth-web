import React from "react";

import { act, fireEvent, render, screen } from "@reearth/test/utils";

import AutoComplete from "./index";

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

test("component should be renered", async () => {
  await act(async () => {
    render(<AutoComplete />);
  });
});

test("component should render items", async () => {
  await act(async () => {
    render(<AutoComplete items={sampleItems} />);
  });
  expect(screen.getByText(/hoge/)).toBeInTheDocument();
  expect(screen.getByText(/fuga/)).toBeInTheDocument();
});

test("component should be inputtable", async () => {
  await act(async () => {
    render(<AutoComplete items={sampleItems} />);
  });

  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "hoge" } });
  expect(screen.getByText("hoge")).toBeInTheDocument();
});
test("component should trigger keydown event", async () => {
  await act(async () => {
    render(<AutoComplete items={sampleItems} />);
  });

  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: "hoge" } });
  // fireEvent.keyDown(input, { key: "Enter" });
  // expect(screen.getByText("hoge")).toBeInTheDocument();
});
