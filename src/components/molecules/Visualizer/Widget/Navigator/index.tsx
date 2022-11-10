import { ComponentProps as WidgetProps } from "@reearth/components/molecules/Visualizer/Widget";

import { SceneProperty } from "../../Engine";

import useHooks from "./hooks";
import NavigatorPresenter from "./NavigatorPresenter";

export type Props = WidgetProps<SceneProperty>;

const Navigator = ({ sceneProperty }: Props): JSX.Element | null => {
  const { sceneMode, degree, events } = useHooks({ sceneProperty });

  return <NavigatorPresenter sceneMode={sceneMode} degree={degree} {...events} />;
};

export default Navigator;
