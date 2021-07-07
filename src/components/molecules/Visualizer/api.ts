import {
  Primitive,
  Primitives,
  Visualizer,
  FlyToDestination,
  CameraOptions,
  LookAtDestination,
  Camera,
} from "@reearth/plugin";
import type { CommonGlobalThis } from "./context";
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

export default function (options: Options): CommonGlobalThis {
  const primitives = getPrimitives(options);
  const visualizer = getVisualizer(options);

  const consolelog = (...args: any[]) => {
    console.log(...args);
  };
  const consolerror = (...args: any[]) => {
    console.error(...args);
  };

  const api: CommonGlobalThis = {
    console: {
      // TODO: using getter occurs "Lifetime not alive" error
      log: consolelog,
      error: consolerror,
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

  return api;
}

function getPrimitives({
  primitives,
  selectedPrimitive,
  selectPrimitive,
  showPrimitive,
  hidePrimitive,
}: Options): Primitives {
  const select = (id?: string) => selectPrimitive(id);
  const show = (...id: string[]) => showPrimitive(...id);
  const hide = (...id: string[]) => hidePrimitive(...id);

  return {
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
  };
}

function getVisualizer({ engine, engineName, camera }: Options): Visualizer {
  const flyTo = (dest: FlyToDestination, options?: CameraOptions) => engine()?.flyTo(dest, options);
  const lookAt = (dest: LookAtDestination, options?: CameraOptions) =>
    engine()?.lookAt(dest, options);
  const zoomIn = (amount: number) => engine()?.zoomIn(amount);
  const zoomOut = (amount: number) => engine()?.zoomOut(amount);

  return {
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
  };
}
