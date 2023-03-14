import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Component from ".";

test("works", async () => {
  // Empty html prop
  const { rerender } = render(<Component />);
  expect(screen.queryByTestId("iframe")).not.toBeInTheDocument();

  // Set html prop
  rerender(<Component html="<h1>Hoge</h1>" />);
  expect(screen.getByTestId("iframe")).toBeInTheDocument();
});
