import { AppearanceTypes } from "../types";

const appearanceKeysObj: { [k in keyof AppearanceTypes]: 1 } = {
  marker: 1,
};

export const appearanceKeys = Object.keys(appearanceKeysObj);
