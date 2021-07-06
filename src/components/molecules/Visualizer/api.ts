import {
  CommonGlobalThis,
  Primitive,
  Primitives,
  Visualizer,
  EventEmitter,
  FlyToDestination,
  CameraOptions,
  LookAtDestination,
  Camera,
} from "@reearth/plugin";
import events from "@reearth/util/event";
import { EngineRef } from "./Engine/ref";

export type Options = {
  engine: () => EngineRef | null;
  engineName: () => string;
  camera: () => Camera | undefined;
  primitives: () => Primitive[];
  selectedPrimitive: () => Primitive | undefined;
  selectPrimitive: (id?: string) => void;
  showPrimitive: (...id: string[]) => void;
  hidePrimitive: (...id: string[]) => void;
};

export default function (
  options: Options,
): [CommonGlobalThis, (type: string, type2: string, ...args: any[]) => void] {
  const [primitives, primitivesEmit] = getPrimitives(options);
  const [visualizer, visualizerEmit] = getVisualizer(options);

  const emitters: { [type in string]?: EventEmitter } = {
    primitives: primitivesEmit,
    visualizer: visualizerEmit,
  };

  const consolelog = (...args: any[]) => {
    console.log(...args);
  };
  const consolerror = (...args: any[]) => {
    console.error(...args);
  };

  const api: CommonGlobalThis = {
    console: {
      get log() {
        return consolelog;
      },
      get error() {
        return consolerror;
      },
    },
    reearth: {
      get version() {
        return window.REEARTH_CONFIG?.version || "";
      },
      get apiVersion() {
        return 0;
      },
      get primitives() {
        return primitives;
      },
      get visualizer() {
        return visualizer;
      },
    },
  };

  const emit = (type: string, type2: string, ...args: any[]) => emitters[type]?.(type2, ...args);

  return [api, emit];
}

function getPrimitives({
  primitives,
  selectedPrimitive,
  selectPrimitive,
  showPrimitive,
  hidePrimitive,
}: Options): [Primitives, EventEmitter] {
  const [event, emit, eventFn] = events();
  const onselect = eventFn("select");
  const select = (id?: string) => selectPrimitive(id);
  const show = (...id: string[]) => showPrimitive(...id);
  const hide = (...id: string[]) => hidePrimitive(...id);

  return [
    {
      get primitives() {
        return primitives();
      },
      get selected() {
        return selectedPrimitive();
      },
      get select() {
        return select;
      },
      get show() {
        return show;
      },
      get hide() {
        return hide;
      },
      get onselect() {
        return onselect[0]();
      },
      set onselect(value) {
        onselect[1](value);
      },
      ...event,
    },
    emit,
  ];
}

function getVisualizer({ engine, engineName, camera }: Options): [Visualizer, EventEmitter] {
  const [event, emit, eventFn] = events();
  const oncameramove = eventFn("cameramove");
  const flyTo = (dest: FlyToDestination, options?: CameraOptions) => engine()?.flyTo(dest, options);
  const lookAt = (dest: LookAtDestination, options?: CameraOptions) =>
    engine()?.lookAt(dest, options);
  const zoomIn = (amount: number) => engine()?.zoomIn(amount);
  const zoomOut = (amount: number) => engine()?.zoomOut(amount);

  return [
    {
      get engine() {
        return engineName();
      },
      get camera() {
        return camera();
      },
      get flyTo() {
        return flyTo;
      },
      get lookAt() {
        return lookAt;
      },
      get zoomIn() {
        return zoomIn;
      },
      get zoomOut() {
        return zoomOut;
      },
      get oncameramove() {
        return oncameramove[0];
      },
      set oncameramove(value) {
        oncameramove[1](value);
      },
      ...event,
    },
    emit,
  ];
}
