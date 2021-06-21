import { action } from "@storybook/addon-actions";
import type { CommonAPI, Primitive } from "..";

const primitives: Primitive[] = [
  {
    id: "a",
    title: "A",
    property: {
      default: {
        location: {
          lat: 10,
          lng: 10,
        },
        height: 10,
      },
    },
  },
  {
    id: "b",
    title: "B",
    property: {
      default: {
        location: {
          lat: 20,
          lng: 20,
        },
        height: 20,
      },
    },
  },
  {
    id: "c",
    title: "C",
    property: {
      default: {
        location: {
          lat: 30,
          lng: 30,
        },
        height: 30,
      },
    },
  },
];

export const commonApi: CommonAPI = {
  flyTo: act("flyTo"),
  getLayer: act("getLayer", id => primitives.find(p => p.id === id)),
  getLayers: act("getLayers", layers => layers.map(id => primitives.find(p => p.id === id))),
  getLocationFromScreenXY: act("getLocationFromScreenXY", () => undefined),
  requestRender: act("requestRender"),
  selectLayer: act("selectLayer"),
  camera: {
    lat: 0,
    lng: 0,
    height: 0,
    heading: 0,
    pitch: 0,
    roll: 0,
    fov: Math.PI * (60 / 180),
  },
  primitives,
};

function act<T extends any[], M extends (...args: T) => any>(
  name: string,
  mock?: M,
): (...args: T) => ReturnType<M> {
  const a = action(`Common API: ${name}`);
  return (...args) => {
    a(...args);
    return mock?.(...args);
  };
}
