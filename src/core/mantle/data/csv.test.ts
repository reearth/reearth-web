import { expect, test, vi } from "vitest";

import { fetchCSV } from "./csv";
import * as Utils from "./utils";

test("with header", async () => {
  const fetchDataMock = vi.spyOn(Utils, "f");
  fetchDataMock.mockImplementation(async () => {
    return {
      text: async () => `id,country,lat,,lng
1,Japan,0,,1
2,US,2,,3
3,UK,4,,5
`,
    } as Response;
  });

  const features = await fetchCSV({
    type: "csv",
    url: "http://example.com",
    csv: {
      idColumn: "id",
      latColumn: "lat",
      lngColumn: "lng",
      noHeader: false,
    },
  });

  expect(features).toEqual([
    {
      id: "1",
      geometry: {
        type: "Point",
        coordinates: [0, 1],
      },
      properties: {
        country: "Japan",
      },
      range: undefined,
    },
    {
      id: "2",
      geometry: {
        type: "Point",
        coordinates: [2, 3],
      },
      properties: {
        country: "US",
      },
      range: undefined,
    },
    {
      id: "3",
      geometry: {
        type: "Point",
        coordinates: [4, 5],
      },
      properties: {
        country: "UK",
      },
      range: undefined,
    },
  ]);
});

test("has header but set index", async () => {
  const fetchDataMock = vi.spyOn(Utils, "f");
  fetchDataMock.mockImplementation(async () => {
    return {
      // lat has no header name
      text: async () => `id,country,,,lng
1,Japan,0,,1
2,US,2,,3
3,UK,4,,5
`,
    } as Response;
  });

  const features = await fetchCSV({
    type: "csv",
    url: "http://example.com",
    csv: {
      idColumn: 0,
      latColumn: 2,
      lngColumn: 100, // This should not found
      noHeader: false,
    },
  });

  expect(features).toEqual([
    {
      id: "1",
      geometry: {
        type: "Point",
        coordinates: [0, undefined],
      },
      properties: {
        country: "Japan",
        lng: "1",
      },
      range: undefined,
    },
    {
      id: "2",
      geometry: {
        type: "Point",
        coordinates: [2, undefined],
      },
      properties: {
        country: "US",
        lng: "3",
      },
      range: undefined,
    },
    {
      id: "3",
      geometry: {
        type: "Point",
        coordinates: [4, undefined],
      },
      properties: {
        country: "UK",
        lng: "5",
      },
      range: undefined,
    },
  ]);
});

test("has multiline field", async () => {
  const fetchDataMock = vi.spyOn(Utils, "f");
  fetchDataMock.mockImplementation(async () => {
    return {
      // lat has no header name
      text: async () => `id,country,lat,text,lng
1,Japan,0,"Hello
World",1
2,US,2,"This is list
- a
- b
- c
",3
3,UK,4,"Hey,
I'm CSV",5
`,
    } as Response;
  });

  const features = await fetchCSV({
    type: "csv",
    url: "http://example.com",
    csv: {
      idColumn: 0,
      latColumn: 2,
      lngColumn: 4, // This should not fount.
      noHeader: false,
    },
  });

  expect(features).toEqual([
    {
      id: "1",
      geometry: {
        type: "Point",
        coordinates: [0, 1],
      },
      properties: {
        country: "Japan",
        text: `Hello
World`,
      },
      range: undefined,
    },
    {
      id: "2",
      geometry: {
        type: "Point",
        coordinates: [2, 3],
      },
      properties: {
        country: "US",
        text: `This is list
- a
- b
- c
`,
      },
      range: undefined,
    },
    {
      id: "3",
      geometry: {
        type: "Point",
        coordinates: [4, 5],
      },
      properties: {
        country: "UK",
        text: `Hey,
I'm CSV`,
      },
      range: undefined,
    },
  ]);
});

test("without header", async () => {
  const fetchDataMock = vi.spyOn(Utils, "f");
  fetchDataMock.mockImplementation(async () => {
    return {
      text: async () => `1,Japan,0,,1
2,US,2,,3
3,UK,4,,5
`,
    } as Response;
  });

  const features = await fetchCSV({
    type: "csv",
    url: "http://example.com",
    csv: {
      idColumn: 0,
      latColumn: 2,
      lngColumn: 4,
      noHeader: true,
    },
  });

  expect(features).toEqual([
    {
      id: "1",
      geometry: {
        type: "Point",
        coordinates: [0, 1],
      },
      properties: {},
      range: undefined,
    },
    {
      id: "2",
      geometry: {
        type: "Point",
        coordinates: [2, 3],
      },
      properties: {},
      range: undefined,
    },
    {
      id: "3",
      geometry: {
        type: "Point",
        coordinates: [4, 5],
      },
      properties: {},
      range: undefined,
    },
  ]);
});

test("some delimiter", async () => {
  const fetchDataMock = vi.spyOn(Utils, "f");
  fetchDataMock.mockImplementation(async () => {
    return {
      text: async () => `1,Japan,0,,1
2;US;2;;3
3\tUK\t4\t\t5
`,
    } as Response;
  });

  const features = await fetchCSV({
    type: "csv",
    url: "http://example.com",
    csv: {
      idColumn: 0,
      latColumn: 2,
      lngColumn: 4,
      noHeader: true,
    },
  });

  expect(features).toEqual([
    {
      id: "1",
      geometry: {
        type: "Point",
        coordinates: [0, 1],
      },
      properties: {},
      range: undefined,
    },
    {
      id: "2",
      geometry: {
        type: "Point",
        coordinates: [2, 3],
      },
      properties: {},
      range: undefined,
    },
    {
      id: "3",
      geometry: {
        type: "Point",
        coordinates: [4, 5],
      },
      properties: {},
      range: undefined,
    },
  ]);
});
