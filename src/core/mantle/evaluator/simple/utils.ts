import { pick } from "lodash-es";

import { StyleExpression } from "../../types";

const JSONPATH_IDENTIFIER = "REEARTH_JSONPATH";

export function getCacheableProperties(styleExpression: StyleExpression, feature?: any) {
  const ref = getCombinedReferences(styleExpression);
  const properties = pick(feature, ref.includes(JSONPATH_IDENTIFIER) ? Object.keys(feature) : ref);
  return properties;
}

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
  const result: string[] = [];
  let exp = expression;
  let i = exp.indexOf("${");
  const varExpRegex = /^\$./;

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
        return result;
      }
      const varExp = exp.slice(i + 2, j);
      if (varExpRegex.test(varExp)) {
        return [JSONPATH_IDENTIFIER];
      } else {
        result.push(exp.substring(i + 2, j));
      }
      exp = exp.substring(j + 1);
    }
    i = exp.indexOf("${");
  }
  return result;
}
