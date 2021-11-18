import React from "react";

import { render, screen, fireEvent } from "../../../test/utils";

import Tag from ".";

test("component should be renered", () => {
  render(<Tag />);
});

test("component should render text and icon", () => {
  render(<Tag icon="bin" text="tag" />);
  expect(screen.getByText("tag")).toBeInTheDocument();
  expect(screen.getByTestId(/atoms-tag-event-trigger/)).toBeInTheDocument();
});

test("component should fire event", () => {
  const handleRemove = jest.fn();
  render(<Tag icon="bin" text="tag" onRemove={handleRemove} />);
  fireEvent.click(screen.getByTestId("atoms-tag-event-trigger"));
  expect(handleRemove).toHaveBeenCalled();
});
