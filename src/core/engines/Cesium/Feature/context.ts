import { createContext, useContext as useReactContext } from "react";

import { CommonReearth, EventEmitter, MouseEvents, ReearthEventType } from "@reearth/core/Map";

import type { Camera, FlyToDestination, CameraOptions } from "../..";

type SelectedReearthEventType = Pick<ReearthEventType, keyof MouseEvents | "layeredit">;

export type Context = {
  selectionReason?: string;
  getCamera?: () => Camera | undefined;
  flyTo?: (camera: FlyToDestination, options?: CameraOptions) => void;
  emit?: EventEmitter<SelectedReearthEventType>;
  reearth?: CommonReearth;
};

export const context = createContext<Context>({});

export const useContext = () => useReactContext(context);
