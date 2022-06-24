import { Meta } from "@storybook/react";

import Icon from "../Icon";

import Timeline from ".";

export default {
  title: "atoms/Timeline/Timeline",
  component: Timeline,
} as Meta;

export const Normal = () => (
  <Timeline
    currentTime={new Date("2022-06-30T12:20:00.000").getTime()}
    timelineRange={[
      new Date("2022-06-30T00:00:00.000").getTime(),
      new Date("2022-07-03T12:21:21.221").getTime(),
    ]}
    iconWidth={25}
    renderIcon={() => <Icon icon="ellipse" alt="ellipse" size={25} />}
  />
);
