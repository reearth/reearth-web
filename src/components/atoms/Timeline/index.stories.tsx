import { Meta } from "@storybook/react";

import Timeline from ".";

export default {
  title: "atoms/Timeline/Timeline",
  component: Timeline,
} as Meta;

export const Normal = () => (
  <Timeline
    currentTime={new Date("2022-07-01T01:20:00.000").getTime()}
    timelineRange={[
      new Date("2022-06-30T00:00:00.000").getTime(),
      new Date("2022-07-03T12:21:21.221").getTime(),
    ]}
    renderIcon={() => (
      <div style={{ background: "red", width: 15, height: 15, transform: "rotate(45deg)" }} />
    )}
  />
);
