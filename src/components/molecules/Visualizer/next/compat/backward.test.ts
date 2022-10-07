import { expect, test } from "vitest";

import type { Infobox, Tag } from "../../Plugin/types";

import { convertLayer, getCompat } from "./backward";

const infobox: Infobox = { blocks: [], property: { default: { bgcolor: "red" } } };
const tags: Tag[] = [{ id: "x", label: "x" }];

test("group", () => {
  expect(
    convertLayer({
      id: "xxx",
      type: "group",
      children: [
        {
          id: "yyy",
          type: "group",
          children: [],
        },
      ],
      hidden: true,
      compat: {
        property: { a: 1 },
        propertyId: "p",
        extensionId: "hoge",
      },
      title: "title",
      creator: "creator",
      infobox,
      tags,
    }),
  ).toEqual({
    id: "xxx",
    type: "group",
    children: [
      {
        id: "yyy",
        type: "group",
        children: [],
        isVisible: true,
      },
    ],
    isVisible: false,
    title: "title",
    creator: "creator",
    infobox,
    tags,
    pluginId: "reearth",
    extensionId: "hoge",
    property: { a: 1 },
    propertyId: "p",
  });
});

test("item", () => {
  expect(
    convertLayer({
      id: "xxx",
      type: "simple",
      hidden: true,
      compat: {
        property: { a: 1 },
        propertyId: "p",
        extensionId: "hoge",
      },
      title: "title",
      creator: "creator",
      infobox,
      tags,
    }),
  ).toEqual({
    id: "xxx",
    type: "item",
    isVisible: false,
    title: "title",
    creator: "creator",
    infobox,
    tags,
    pluginId: "reearth",
    extensionId: "hoge",
    property: { a: 1 },
    propertyId: "p",
  });
});

test("getCompat", () => {
  expect(getCompat(undefined)).toBeUndefined();
  expect(getCompat({ type: "aaa" } as any)).toBeUndefined();
});

test("marker", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [1, 2, 3],
          },
        },
      },
      marker: {
        pointColor: "red",
      },
      compat: {
        propertyId: "p",
      },
    }),
  ).toEqual({
    extensionId: "marker",
    propertyId: "p",
    property: {
      default: {
        location: { lat: 2, lng: 1 },
        height: 3,
        pointColor: "red",
      },
    },
  });
});

test("polyline", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [1, 2, 3],
              [2, 3, 4],
            ],
          },
        },
      },
      polyline: {
        strokeColor: "red",
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "polyline",
    propertyId: "p",
    property: {
      default: {
        coordinates: [
          { lat: 2, lng: 1, height: 3 },
          { lat: 3, lng: 2, height: 4 },
        ],
        strokeColor: "red",
      },
    },
  });
});

test("polygon", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [1, 2, 3],
                [2, 3, 4],
              ],
            ],
          },
        },
      },
      polygon: {
        fillColor: "red",
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "polygon",
    propertyId: "p",
    property: {
      default: {
        polygon: [
          [
            { lat: 2, lng: 1, height: 3 },
            { lat: 3, lng: 2, height: 4 },
          ],
        ],
        fillColor: "red",
      },
    },
  });
});

test("legacy_photooverlay", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [10, 20, 30], // it should be ignored
          },
        },
      },
      legacy_photooverlay: {
        location: { lat: 2, lng: 1 },
        height: 3,
        aaaa: 1,
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "photooverlay",
    propertyId: "p",
    property: {
      default: {
        location: { lat: 2, lng: 1 },
        height: 3,
        aaaa: 1,
      },
    },
  });
});

test("ellipsoid", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "geojson",
        value: {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [1, 2, 3],
          },
        },
      },
      ellipsoid: {
        radii: 100,
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "ellipsoid",
    propertyId: "p",
    property: {
      default: {
        position: { lat: 2, lng: 1 },
        height: 3,
        radii: 100,
      },
    },
  });
});

test("model", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "gltf",
        url: "xxx",
      },
      model: {
        hoge: 1,
        color: "red",
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "model",
    propertyId: "p",
    property: {
      default: {
        url: "xxx",
        hoge: 1,
      },
      appearance: {
        color: "red",
      },
    },
  });
});

test("3dtiles", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      data: {
        type: "3dtiles",
        url: "xxx",
      },
      "3dtiles": {
        aaaa: 1,
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "tileset",
    propertyId: "p",
    property: {
      default: {
        url: "xxx",
        aaaa: 1,
      },
    },
  });
});

test("legacy_resource", () => {
  expect(
    getCompat({
      id: "xxx",
      type: "simple",
      legacy_resource: {
        url: "xxx",
        aaaa: 1,
      },
      compat: {
        propertyId: "p",
      },
    } as any),
  ).toEqual({
    extensionId: "resource",
    propertyId: "p",
    property: {
      default: {
        url: "xxx",
        aaaa: 1,
      },
    },
  });
});
