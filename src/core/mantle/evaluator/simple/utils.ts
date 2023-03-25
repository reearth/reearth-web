import { pick } from "lodash-es";

import { Feature, StyleExpression } from "../../types";

const JSONPATH_REGEX =
  /\$[a-zA-Z_][a-zA-Z0-9_]*(\[[^\]]+\])?(\.[a-zA-Z_][a-zA-Z0-9_]*(\[[^\]]+\])?)*$/g;

export function getCombinedReferences(expression: StyleExpression): string[] {
  if (typeof expression === "string") {
    return getReferences(expression);
  } else {
    const references: string[] = [];
    for (const [condition, value] of expression.conditions) {
      references.push(...getReferences(condition), ...getReferences(value));
    }
    return references;
  }
}

export function getReferences(expression: string): string[] {
  if (hasJsonPath(expression)) return ["REEARTH_JSONPATH"];
  const result: string[] = [];
  let exp = expression;
  let i = exp.indexOf("${");

  while (i >= 0) {
    const openSingleQuote = exp.indexOf("'", i);
    const openDoubleQuote = exp.indexOf('"', i);

    if (openSingleQuote >= 0 && openSingleQuote < i) {
      const closeQuote = exp.indexOf("'", openSingleQuote + 1);
      result.push(exp.substring(0, closeQuote + 1));
      exp = exp.substring(closeQuote + 1);
    } else if (openDoubleQuote >= 0 && openDoubleQuote < i) {
      const closeQuote = exp.indexOf('"', openDoubleQuote + 1);
      result.push(exp.substring(0, closeQuote + 1));
      exp = exp.substring(closeQuote + 1);
    } else {
      const j = exp.indexOf("}", i);

      if (j < 0) {
        throw new Error("Unmatched {.");
      }

      result.push(exp.substring(i + 2, j));
      exp = exp.substring(j + 1);
    }

    i = exp.indexOf("${");
  }

  return result;
}

const hasJsonPath = (str: string): boolean => {
  return JSONPATH_REGEX.test(str);
};

export function getCacheableProperties(styleExpression: StyleExpression, feature?: Feature) {
  const ref = getCombinedReferences(styleExpression);
  const properties = pick(
    feature?.properties,
    ref.includes("REEARTH_JSONPATH") ? Object.keys(feature?.properties) : ref,
  );

  return properties;
}
