import { JSONPath } from "jsonpath-plus";
import { pick } from "lodash-es";

import { StyleExpression } from "../../types";

export function getCacheableProperties(styleExpression: StyleExpression, feature?: any) {
  const properties = pick(feature, getCombinedReferences(styleExpression, feature));
  return properties;
}

export function getCombinedReferences(expression: StyleExpression, feature?: any): string[] {
  if (typeof expression === "string") {
    return getReferences(expression, feature);
  } else {
    const references: string[] = [];
    for (const [condition, value] of expression.conditions) {
      references.push(...getReferences(condition, feature), ...getReferences(value, feature));
    }
    return references;
  }
}

export function getReferences(expression: string, feature?: any): string[] {
  const result: string[] = [];
  let exp = expression;
  let i = exp.indexOf("${");
  const varExpRegex = /^\$./;
  const jsonPathCache: Record<string, any[]> = {};

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
        console.log("Unmatched {.");
      }
      const varExp = exp.slice(i + 2, j);
      if (varExpRegex.test(varExp)) {
        let res = jsonPathCache[varExp];
        if (!res) {
          try {
            res = JSONPath({ json: feature, path: varExp });
            jsonPathCache[varExp] = res;
          } catch (error) {
            console.log("Invalid JSONPath");
          }
        }
        if (res.length !== 0) {
          console.log("JSONPathEval: ", res[0]);
          const keyPath = getObjectPathByValue(feature, res[0]);
          if (keyPath) result.push(keyPath);
          else return Object.keys(feature);
        }
      } else {
        result.push(exp.substring(i + 2, j));
      }
      exp = exp.substring(j + 1);
    }

    i = exp.indexOf("${");
  }

  return result;
}

function getObjectPathByValue(obj: any, value: any): string | undefined {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const prop = obj[key];
      if (prop === value) {
        return `[${JSON.stringify(key)}]`;
      } else if (typeof prop === "object") {
        const nestedKey = getObjectPathByValue(prop, value);
        if (nestedKey !== undefined) {
          return `[${JSON.stringify(key)}]${nestedKey}`;
        }
      }
    }
  }
  return undefined;
}
