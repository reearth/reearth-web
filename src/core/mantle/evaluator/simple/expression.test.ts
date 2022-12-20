import { expect, test, describe } from "vitest";

import {
  replaceDefines,
  removeBackslashes,
  replaceBackslashes,
  replaceVariables,
  checkFeature,
} from "./expression";

describe("replaceDefines", () => {
  test("should replace defined placeholders with the corresponding values in the expression string", () => {
    const result = replaceDefines("${key}", { key: "value" });
    expect(result).toBe("(value)");
  });

  test("should handle multiple defined placeholders in the expression string", () => {
    const result = replaceDefines("${key1} + ${key2}", {
      key1: "value1",
      key2: "value2",
    });
    expect(result).toBe("(value1) + (value2)");
  });
});

describe("removeBackslashes", () => {
  test("should remove all backslashes from the expression string", () => {
    const result = removeBackslashes("\\");
    expect(result).toBe("@#%");
  });

  test("should handle multiple backslashes in the expression string", () => {
    const result = removeBackslashes("\\\\");
    expect(result).toBe("@#%@#%");
  });
});

describe("replaceBackslashes", () => {
  test("should replace all occurrences of '@#%' with a backslash in the expression string", () => {
    const result = replaceBackslashes("@#%");
    expect(result).toBe("\\");
  });

  test("should handle multiple occurrences of '@#%' in the expression string", () => {
    const result = replaceBackslashes("@#%@#%");
    expect(result).toBe("\\\\");
  });
});

describe("replaceVariables", () => {
  test("should replace the variable placeholders with the corresponding variable names in the expression string", () => {
    const [result, _] = replaceVariables("${variable}");
    expect(result).toBe("czm_variable");
  });

  test("should handle multiple variable placeholders in the expression string", () => {
    const [result, _] = replaceVariables("${variable1} + ${variable2}");
    expect(result).toBe("czm_variable1 + czm_variable2");
  });

  test("should handle JSONPath palceholders in the expression string", () => {
    const [, res] = replaceVariables("${$.phoneNumbers[:1].type}", {
      id: "blah",
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
    });
    expect(res[0].literal_value).toBe("iPhone");
  });
});

describe("checkFeature", () => {
  test("should correctly identify the 'feature' keyword in the given AST object", () => {
    const result = checkFeature({ _value: "feature" });
    expect(result).toBe(true);
  });

  test("should return false for an AST object that does not contain the 'feature' keyword", () => {
    const result = checkFeature({ _value: "variable" });
    expect(result).toBe(false);
  });
});
