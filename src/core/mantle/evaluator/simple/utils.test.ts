import { expect, test, describe } from "vitest";

import { ConditionsExpression } from "../../types";

import { getReferences, getCacheableProperties, getCombinedReferences } from "./utils";

describe("getCacheableProperties", () => {
  const feature = { foo: "bar", baz: "qux" };
  const styleExpression: ConditionsExpression = {
    conditions: [
      ["${foo}", "${baz}"],
      ["${qux}", "121"],
    ],
  };

  test("should return properties that exist in feature and are referenced in styleExpression", () => {
    const result = getCacheableProperties(styleExpression, feature);
    expect(result).toEqual({ foo: "bar", baz: "qux" });
  });

  test("should return an empty object if no properties are referenced in styleExpression", () => {
    const styleExpression = "some string";
    const result = getCacheableProperties(styleExpression, feature);
    expect(result).toEqual({});
  });
});

describe("getCombinedReferences", () => {
  const feature = { foo: "bar", baz: "qux" };

  test("should return references in a single expression", () => {
    const expression = "${foo}";
    const result = getCombinedReferences(expression, feature);
    expect(result).toEqual(["foo"]);
  });

  test("should return references in a style expression with multiple conditions", () => {
    const expression: ConditionsExpression = {
      conditions: [
        ["${foo}", "${baz}"],
        ["${qux}", "121"],
      ],
    };
    const result = getCombinedReferences(expression, feature);
    expect(result).toEqual(["foo", "baz", "qux"]);
  });

  test("should return an empty array if expression is a string with no references", () => {
    const expression = "some string";
    const result = getCombinedReferences(expression, feature);
    expect(result).toEqual([]);
  });
});

describe("getReferences", () => {
  const feature = {
    foo: "bar",
    baz: "qux",
    obj: {
      arr: [1, 2, 3],
      nestedObj: {
        a: "A",
        b: "B",
      },
    },
  };

  test("should return references in a single expression", () => {
    const expression = "${foo}";
    const result = getReferences(expression, feature);
    expect(result).toEqual(["foo"]);
  });

  test("should return references in an expression with JSONPath expressions", () => {
    const expression = "${$.baz}";
    const result = getReferences(expression, feature);
    expect(result).toEqual(['["baz"]']);
  });

  test("should return references for nested JSONPath expressions", () => {
    const expression = "${$.obj.nestedObj.a}";
    const result = getReferences(expression, feature);
    expect(result).toEqual(['["obj"]["nestedObj"]["a"]']);
  });

  test("should handle JSONPath expressions that return arrays", () => {
    const expression = "${$.obj.arr[1]}";
    const result = getReferences(expression, feature);
    expect(result).toEqual(['["obj"]["arr"]["1"]']);
  });

  test("should return an empty array if expression has no references", () => {
    const expression = "some string";
    const result = getReferences(expression, feature);
    expect(result).toEqual([]);
  });
});
