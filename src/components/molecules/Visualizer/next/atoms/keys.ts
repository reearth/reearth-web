import { AppearanceTypes } from "../types";

export const appearanceKeyObj: { [k in keyof AppearanceTypes]: 1 } = {
  marker: 1,
  polyline: 1,
  polygon: 1,
  ellipsoid: 1,
  model: 1,
  "3dtiles": 1,
  legacy_photooverlay: 1,
  legacy_resource: 1,
};

export const appearanceKeys = Object.keys(appearanceKeyObj);
