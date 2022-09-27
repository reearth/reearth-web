import NavigatorUI from "@reearth/components/atoms/Navigator";
import { ComponentProps as WidgetProps } from "@reearth/components/molecules/Visualizer/Widget";

import { SceneProperty } from "../../Engine";

import useHooks from "./hooks";

export type Props = WidgetProps<SceneProperty>;

const Navigator = ({ sceneProperty }: Props): JSX.Element | null => {
  const { degree, events } = useHooks({ sceneProperty });

  return <NavigatorUI degree={degree} {...events} />;
};

export default Navigator;
