import { KeysOfUnion } from "@reearth/util/util";

import type { LegacyLayer } from "../../compat";
import { appearanceKeyObj } from "../../types";
import type { ComputedLayer, Layer } from "../../types";

import type { LazyLayer } from "./hooks";

const layerKeyObj: {
  // "id" and "compat" should not be read from plugins
  [k in Exclude<KeysOfUnion<Layer | LegacyLayer | LazyLayer>, "id" | "compat">]: 1;
} = {
  // layer
  children: 1,
  data: 1,
  infobox: 1,
  properties: 1,
  tags: 1,
  title: 1,
  type: 1,
  creator: 1,
  computed: 1,
  // appearance
  ...appearanceKeyObj,
  // legacy layer
  property: 1,
  propertyId: 1,
  pluginId: 1,
  extensionId: 1,
  isVisible: 1,
  visible: 1,
};

const computedLayerKeyObj: { [k in Exclude<KeysOfUnion<ComputedLayer>, "id">]: 1 } = {
  features: 1,
  layer: 1,
  originalFeatures: 1,
  properties: 1,
  status: 1,
  ...appearanceKeyObj,
};

export const layerKeys = Object.keys(layerKeyObj);
export const computedLayerKeys = Object.keys(computedLayerKeyObj);
