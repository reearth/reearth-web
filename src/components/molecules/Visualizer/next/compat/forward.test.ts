import { expect, test } from "vitest";

import type { Infobox, Tag } from "../../Plugin/types";

import { convertLegacyLayer } from "./forward";

const infobox: Infobox = { blocks: [], property: { default: { bgcolor: "red" } } };
const tags: Tag[] = [{ id: "x", label: "x" }];

test("group", () => {
  expect(
    convertLegacyLayer({
      id: "xxx",
      type: "group",
      isVisible: true,
      title: "title",
      creator: "aaa",
      infobox,
      tags,
      extensionId: "a",
      propertyId: "p",
      property: { a: 1 },
      children: [
        {
          id: "yyy",
          type: "group",
        },
      ],
    }),
  ).toEqual({
    id: "xxx",
    type: "group",
    title: "title",
    visible: true,
    compat: {
      property: { a: 1 },
      extensionId: "a",
      propertyId: "p",
    },
    infobox,
    tags,
    creator: "aaa",
    children: [
      {
        id: "yyy",
        type: "group",
        children: [],
      },
    ],
  });
});

test("marker", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      type: "item",
      extensionId: "marker",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          location: { lat: 1, lng: 2 },
          height: 3,
          pointColor: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [2, 1, 3],
        },
      },
    },
    visible: true,
    marker: {
      pointColor: "red",
    },
    compat: {
      extensionId: "marker",
      propertyId: "p",
      property: {
        default: {
          location: { lat: 1, lng: 2 },
          height: 3,
          pointColor: "red",
        },
      },
    },
  });
});

test("polyline", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      type: "item",
      extensionId: "polyline",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          coordinates: [
            { lat: 1, lng: 2, height: 3 },
            { lat: 2, lng: 3, height: 4 },
          ],
          strokeColor: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: [
            [2, 1, 3],
            [3, 2, 4],
          ],
        },
      },
    },
    visible: true,
    polyline: {
      strokeColor: "red",
    },
    compat: {
      extensionId: "polyline",
      propertyId: "p",
      property: {
        default: {
          coordinates: [
            { lat: 1, lng: 2, height: 3 },
            { lat: 2, lng: 3, height: 4 },
          ],
          strokeColor: "red",
        },
      },
    },
  });
});

test("polygon", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      type: "item",
      extensionId: "polygon",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          polygon: [
            [
              { lat: 1, lng: 2, height: 3 },
              { lat: 2, lng: 3, height: 4 },
            ],
          ],
          strokeColor: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [2, 1, 3],
              [3, 2, 4],
            ],
          ],
        },
      },
    },
    visible: true,
    polygon: {
      strokeColor: "red",
    },
    compat: {
      extensionId: "polygon",
      propertyId: "p",
      property: {
        default: {
          polygon: [
            [
              { lat: 1, lng: 2, height: 3 },
              { lat: 2, lng: 3, height: 4 },
            ],
          ],
          strokeColor: "red",
        },
      },
    },
  });
});

test("rect", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      type: "item",
      extensionId: "rect",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          rect: {
            north: 1,
            east: 2,
            south: 3,
            west: 4,
          },
          height: 3,
          strokeColor: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [4, 1, 3],
              [2, 1, 3],
              [2, 3, 3],
              [4, 3, 3],
              [4, 1, 3],
            ],
          ],
        },
      },
    },
    visible: true,
    polygon: {
      strokeColor: "red",
    },
    compat: {
      extensionId: "rect",
      propertyId: "p",
      property: {
        default: {
          rect: {
            north: 1,
            east: 2,
            south: 3,
            west: 4,
          },
          height: 3,
          strokeColor: "red",
        },
      },
    },
  });
});

test("photooverlay", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      type: "item",
      extensionId: "photooverlay",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          location: { lat: 1, lng: 2 },
          height: 3,
          hoge: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    visible: true,
    legacy_photooverlay: {
      location: { lat: 1, lng: 2 },
      height: 3,
      hoge: "red",
    },
    compat: {
      extensionId: "photooverlay",
      propertyId: "p",
      property: {
        default: {
          location: { lat: 1, lng: 2 },
          height: 3,
          hoge: "red",
        },
      },
    },
  });
});

test("ellipsoid", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      type: "item",
      extensionId: "ellipsoid",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          position: { lat: 1, lng: 2 },
          height: 3,
          radii: 100,
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    data: {
      type: "geojson",
      value: {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [2, 1, 3],
        },
      },
    },
    visible: true,
    ellipsoid: {
      radii: 100,
    },
    compat: {
      extensionId: "ellipsoid",
      propertyId: "p",
      property: {
        default: {
          position: { lat: 1, lng: 2 },
          height: 3,
          radii: 100,
        },
      },
    },
  });
});

test("model", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      type: "item",
      extensionId: "model",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          model: "xxx",
          hoge: "red",
        },
        appearance: {
          aaa: 1,
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    visible: true,
    data: {
      type: "gltf",
      url: "xxx",
    },
    model: {
      hoge: "red",
      aaa: 1,
    },
    compat: {
      extensionId: "model",
      propertyId: "p",
      property: {
        default: {
          model: "xxx",
          hoge: "red",
        },
        appearance: {
          aaa: 1,
        },
      },
    },
  });
});

test("3dtiles", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      type: "item",
      extensionId: "tileset",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          tileset: "xxx",
          hoge: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    visible: true,
    data: {
      type: "3dtiles",
      url: "xxx",
    },
    "3dtiles": {
      hoge: "red",
    },
    compat: {
      extensionId: "tileset",
      propertyId: "p",
      property: {
        default: {
          tileset: "xxx",
          hoge: "red",
        },
      },
    },
  });
});

test("resource", () => {
  expect(
    convertLegacyLayer({
      id: "x",
      type: "item",
      extensionId: "resource",
      propertyId: "p",
      isVisible: true,
      property: {
        default: {
          url: "xxx",
          hoge: "red",
        },
      },
    }),
  ).toEqual({
    id: "x",
    type: "simple",
    visible: true,
    legacy_resource: {
      url: "xxx",
      hoge: "red",
    },
    compat: {
      extensionId: "resource",
      propertyId: "p",
      property: {
        default: {
          url: "xxx",
          hoge: "red",
        },
      },
    },
  });
});
