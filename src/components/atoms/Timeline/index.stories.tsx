import { Meta, Story } from "@storybook/react";
import { useCallback, useState } from "react";

import Icon from "../Icon";

import Timeline, { Props } from ".";

export default {
  title: "atoms/Timeline/Timeline",
  component: Timeline,
} as Meta;

export const Normal: Story<Props> = () => (
  <Timeline
    currentTime={new Date("2022-06-30T12:20:00.000").getTime()}
    range={{
      start: new Date("2022-06-30T21:00:00.000").getTime(),
      end: new Date("2022-07-03T12:21:21.221").getTime(),
    }}
    knobSize={25}
    renderKnob={() => <Icon icon="ellipse" alt="ellipse" size={25} />}
  />
);

export const DefaultRange: Story<Props> = () => (
  <Timeline
    // Forward a hour
    currentTime={Date.now() + 3600000}
    knobSize={25}
    renderKnob={() => <Icon icon="ellipse" alt="ellipse" size={25} />}
  />
);

export const Movable: Story<Props> = () => {
  const [currentTime, setCurrentTime] = useState(() => Date.now() + 3600000);
  const onClick = useCallback(setCurrentTime, [setCurrentTime]);
  const onDrag = useCallback(setCurrentTime, [setCurrentTime]);
  return (
    <Timeline
      // Forward a hour
      currentTime={currentTime}
      knobSize={25}
      renderKnob={() => <Icon icon="ellipse" alt="ellipse" size={25} />}
      onClick={onClick}
      onDrag={onDrag}
    />
  );
};
