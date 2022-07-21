import { useState } from "react";

import { render, screen, fireEvent } from "@reearth/test/utils";

import {
  PADDING_HORIZONTAL,
  BORDER_WIDTH,
  KNOB_SIZE,
  NORMAL_SCALE_WIDTH,
  GAP_HORIZONTAL,
} from "./constants";

import Timeline from ".";

const CURRENT_TIME = new Date("2022-07-03T12:21:21.100").getTime();
// This is width when range is one day.
const SCROLL_WIDTH = 2208;

const TimelineWrapper: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(CURRENT_TIME);
  return (
    <Timeline
      currentTime={currentTime}
      range={{ start: CURRENT_TIME }}
      onClick={setCurrentTime}
      onDrag={setCurrentTime}
    />
  );
};

test("it should get time from clicked position", () => {
  render(<TimelineWrapper />);
  const slider = screen.getByRole("slider");
  const currentPosition = 12;
  jest.spyOn(slider, "scrollWidth", "get").mockImplementation(() => SCROLL_WIDTH);

  fireEvent.click(slider, {
    clientX: PADDING_HORIZONTAL + BORDER_WIDTH + currentPosition,
  });

  const iconWrapper = screen.getByTestId("knob-icon");
  const actualLeft = Math.trunc(parseInt(iconWrapper.style.left.split("px")[0]));
  expect(actualLeft).toBe(
    Math.trunc(currentPosition + PADDING_HORIZONTAL - KNOB_SIZE / 2 + NORMAL_SCALE_WIDTH),
  );
});

test("it should get time from mouse moved position", () => {
  render(<TimelineWrapper />);
  const slider = screen.getByRole("slider");
  const currentPosition = 12;
  const clientX = PADDING_HORIZONTAL + BORDER_WIDTH + currentPosition;
  const expectedLeft = Math.trunc(
    currentPosition + PADDING_HORIZONTAL - KNOB_SIZE / 2 + NORMAL_SCALE_WIDTH,
  );

  const scroll = jest.fn();
  window.HTMLElement.prototype.scroll = scroll;

  jest.spyOn(slider, "scrollWidth", "get").mockImplementation(() => SCROLL_WIDTH);

  // Check initial position
  expect(Math.trunc(parseInt(screen.getByTestId("knob-icon").style.left.split("px")[0], 10))).toBe(
    expectedLeft - currentPosition,
  );

  // It should not move
  fireEvent.mouseMove(slider, {
    clientX,
  });
  expect(Math.trunc(parseInt(screen.getByTestId("knob-icon").style.left.split("px")[0], 10))).toBe(
    expectedLeft - currentPosition,
  );

  // It should move
  fireEvent.mouseDown(slider);
  fireEvent.mouseMove(slider, {
    clientX,
  });
  fireEvent.mouseUp(slider);
  expect(Math.trunc(parseInt(screen.getByTestId("knob-icon").style.left.split("px")[0], 10))).toBe(
    expectedLeft,
  );

  // It should not move
  fireEvent.mouseMove(slider, {
    clientX: clientX * 2,
  });
  expect(Math.trunc(parseInt(screen.getByTestId("knob-icon").style.left.split("px")[0], 10))).toBe(
    expectedLeft,
  );
});

test("it should get correct strongScaleHours from amount of scroll", () => {
  render(<TimelineWrapper />);
  const slider = screen.getByRole("slider");
  jest.spyOn(slider, "scrollWidth", "get").mockImplementation(() => SCROLL_WIDTH);

  fireEvent.wheel(slider, {
    deltaY: -50,
  });
  expect(
    parseInt(slider.querySelector("div")?.style.gap.split(" ")[1].split("px")[0] || "", 10),
  ).toBe(GAP_HORIZONTAL * 1.5);

  // Reset gap and increase memory.
  fireEvent.wheel(slider, {
    deltaY: -50,
  });
  expect(
    parseInt(slider.querySelector("div")?.style.gap.split(" ")[1].split("px")[0] || "", 10),
  ).toBe(GAP_HORIZONTAL);
});
