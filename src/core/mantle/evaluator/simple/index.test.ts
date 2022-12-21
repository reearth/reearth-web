import { expect, test, describe } from "vitest";

import { evalLayerAppearances, evalSimpleLayer } from ".";

test("evalSimpleLayer", async () => {
  expect(
    await evalSimpleLayer(
      {
        id: "x",
        type: "simple",
        data: {
          type: "geojson",
        },
        marker: {
          pointColor: "'#FF0000'",
          pointSize: { conditions: [["true", "1"]] },
        },
      },
      {
        getAllFeatures: async () => [{ id: "a" }],
        getFeatures: async () => undefined,
      },
    ),
  ).toEqual({
    layer: {
      marker: {
        pointColor: "#FF0000",
        pointSize: 1,
      },
    },
    features: [
      {
        id: "a",
        marker: {
          pointColor: "#FF0000",
          pointSize: 1,
        },
      },
    ],
  });
});

describe("Conditional styling", () => {
  test("conditions with variables from properties, members and Strictly Equals", () => {
    expect(
      evalLayerAppearances(
        {
          marker: {
            pointColor: "'#FF0000'",
            pointSize: {
              conditions: [
                ["${id} === '2432432'", "2"],
                ["true", "1"],
              ],
            },
          },
        },
        {
          id: "x",
          type: "simple",
        },
        {
          id: "1233",
          properties: {
            id: "2432432",
          },
        },
      ),
    ).toEqual({
      marker: {
        pointColor: "#FF0000",
        pointSize: 2,
      },
    });
  });

  test("conditions with variables from feature, members and Strictly Equals", () => {
    expect(
      evalLayerAppearances(
        {
          marker: {
            pointColor: "'#FF0000'",
            pointSize: {
              conditions: [
                ["${id} === '1233'", "4232"],
                ["true", "1"],
              ],
            },
          },
        },
        {
          id: "x",
          type: "simple",
        },
        {
          id: "1233",
          properties: {
            foo: "122",
          },
        },
      ),
    ).toEqual({
      marker: {
        pointColor: "#FF0000",
        pointSize: 4232,
      },
    });
  });

  test("conditions with variables, builtIn function and GreaterThan", () => {
    expect(
      evalLayerAppearances(
        {
          marker: {
            pointColor: {
              conditions: [
                ["atan2(${GridY}, ${GridX}) > 0.0", "14343"],
                ["true", "123232"],
              ],
            },
            pointSize: 23213,
          },
        },
        {
          id: "x",
          type: "simple",
        },
        {
          id: "blah",
          properties: {
            GridY: 5,
            GridX: 5,
            properties: {
              id: "2432432",
            },
          },
        },
      ),
    ).toEqual({
      marker: {
        pointColor: 14343,
        pointSize: 23213,
      },
    });
  });

  test("Conditions with JSONPath, strictly equal and JSONPath result", () => {
    expect(
      evalLayerAppearances(
        {
          marker: {
            pointColor: "'#FF0000'",
            pointSize: {
              conditions: [
                ["${$.phoneNumbers[:1].type} === 'iPhone'", "${$.age}"],
                ["true", "1"],
              ],
            },
          },
        },
        {
          id: "x",
          type: "simple",
        },
        {
          id: "blah",
          properties: {
            firstName: "John",
            lastName: "doe",
            age: 26,
            address: {
              streetAddress: "naist street",
              city: "Nara",
              postalCode: "630-0192",
            },
            phoneNumbers: [
              {
                type: "iPhone",
                number: "0123-4567-8888",
              },
              {
                type: "home",
                number: "0123-4567-8910",
              },
            ],
          },
        },
      ),
    ).toEqual({
      marker: {
        pointColor: "#FF0000",
        pointSize: 26,
      },
    });
  });
});
