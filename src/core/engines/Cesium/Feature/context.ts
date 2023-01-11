import { createContext, useContext as useReactContext } from "react";

import type { Camera, FlyToDestination, CameraOptions, LayerSelectionReason } from "../..";

export type Context = {
  selectionReason?: LayerSelectionReason;
  getCamera?: () => Camera | undefined;
  flyTo?: (camera: FlyToDestination, options?: CameraOptions) => void;
};

export const context = createContext<Context>({});

export const useContext = () => useReactContext(context);
