import { expect, test, describe } from "vitest";

import { ConditionsExpression } from "../../types";

import { getReferences, getCombinedReferences } from "./utils";

describe("getReferences", () => {
  test("should return an empty array when the input is an empty string", () => {
    expect(getReferences("")).toEqual([]);
  });

  test("should return the input string as a single element array when it contains no placeholders", () => {
    expect(getReferences("hello world")).toEqual([]);
  });

  test("should return the input string with placeholders replaced by variable references", () => {
    expect(getReferences("a${b}c${d}e${f}g")).toEqual(["b", "d", "f"]);
  });

  test("should return the input string with placeholders inside quotes left unchanged", () => {
    expect(getReferences("a'${b}'c\"${d}\"e${f}g")).toEqual(["b", "d", "f"]);
  });

  test("should throw an error if a placeholder is not closed", () => {
    expect(() => getReferences("a${b")).toThrowError("Unmatched {.");
  });
});

describe("getCombinedReferences", () => {
  test("should return an empty array when the input is an empty string", () => {
    expect(getCombinedReferences("")).toEqual([]);
  });

  test("should return the variable references from a single string", () => {
    expect(getCombinedReferences("a${b}c${d}e${f}g")).toEqual(["b", "d", "f"]);
  });

  test("should return the combined variable references from all conditions", () => {
    const expression: ConditionsExpression = {
      conditions: [
        ["${a} > 1", "red"],
        ["${b} === 'foo'", "blue"],
        ["${c} !== true", "green"],
      ],
    };

    expect(getCombinedReferences(expression)).toEqual(["a", "b", "c"]);
  });

  test("should return an empty array when the input is an empty condition", () => {
    const expression: ConditionsExpression = {
      conditions: [],
    };

    expect(getCombinedReferences(expression)).toEqual([]);
  });

  test("should return the variable references from a single condition", () => {
    const expression: ConditionsExpression = {
      conditions: [["${a} > 1", "red"]],
    };

    expect(getCombinedReferences(expression)).toEqual(["a"]);
  });

  test("should handle quotes in conditions and values", () => {
    const expression: ConditionsExpression = {
      conditions: [
        ["${a} > 1 && '${b}' === \"bar\"", "red"],
        ["'${c}' === '${d}'", "blue"],
      ],
    };

    expect(getCombinedReferences(expression)).toEqual(["a", "b", "c", "d"]);
  });
});
