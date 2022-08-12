import { expect, test } from "vitest";

import { arrayObjectDiff, arrayIndexDiff } from "./diff";

test("arrayIndexDiff", () => {
  expect(arrayIndexDiff(["a", "b", "c"], ["a", "b", "c"])).toEqual([]);

  expect(arrayIndexDiff(["a", "b", "c"], ["b", "a", "c"])).toEqual([["b", 1, 0]]);

  expect(arrayIndexDiff(["a", "b", "c"], ["a", "c"])).toEqual([["b", 1, -1]]);

  expect(arrayIndexDiff(["a", "b", "c"], ["a", "d", "b", "c"])).toEqual([["d", -1, 1]]);

  expect(arrayIndexDiff(["a", "b", "c", "f", "g"], ["b", "a", "d", "g", "e"])).toEqual([
    ["b", 1, 0],
    ["d", -1, 4],
    ["e", -1, 6],
    ["c", 2, -1],
    ["f", 3, -1],
  ]);
});

test("arrayDiff", () => {
  expect(arrayObjectDiff([{ a: 1 }], [{ a: 2 }], "a")).toEqual({
    added: [{ a: 2 }],
    deleted: [{ a: 1 }],
  });
});
