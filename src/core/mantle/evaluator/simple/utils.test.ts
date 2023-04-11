import { expect, test, describe } from "vitest";

import { Feature, StyleExpression } from "../../types";

import { getReferences, getCacheableProperties, getCombinedReferences } from "./utils";

describe("getCacheableProperties", () => {
  const feature: Feature = {
    id: "test",
    type: "feature",
    properties: {
      name: "Test Feature",
      description: "This is a test feature",
      test: "test_path",
    },
  };

  const styleExpression: StyleExpression = "color: ${test}";

  test("should return cacheable properties", () => {
    const properties = getCacheableProperties(styleExpression, feature);
    expect(properties).toEqual({ test: "test_path" });
  });

  const styleExpressionBeta: StyleExpression = "color: ${$.['test_var']}";

  test("should return combined references", () => {
    const references = getCacheableProperties(styleExpressionBeta, feature);
    expect(references).toEqual({
      name: "Test Feature",
      description: "This is a test feature",
      test: "test_path",
    });
  });
});

describe("getCombinedReferences", () => {
  const styleExpression: StyleExpression = {
    conditions: [
      ["${test_var} === 1", "color: blue"],
      ["${test_var} === 2", "color: red"],
    ],
  };

  test("should return combined references", () => {
    const references = getCombinedReferences(styleExpression);
    expect(references).toEqual(["test_var", "test_var"]);
  });
});

describe("getReferences", () => {
  test("should return references in a string expression", () => {
    const references = getReferences("color: ${test_var}");
    expect(references).toEqual(["test_var"]);
  });

  test("should return references in a string expression with quotes", () => {
    const references = getReferences('color: "${test_var}"');
    expect(references).toEqual(["test_var"]);
  });

  test("should return references in a string expression with single quotes", () => {
    const references = getReferences("color: '${test_var}'");
    expect(references).toEqual(["test_var"]);
  });

  test("should return JSONPATH_IDENTIFIER for expressions with variable expression syntax", () => {
    const references = getReferences("color: ${$.['test_var']}");
    expect(references).toEqual(["REEARTH_JSONPATH"]);
  });
});
