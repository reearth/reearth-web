import { pick } from "lodash-es";
import LRUCache from "lru-cache";

import {
  appearanceKeys,
  AppearanceTypes,
  ComputedFeature,
  Feature,
  LayerAppearanceTypes,
  LayerSimple,
  ExpressionContainer,
  TimeInterval,
  StyleExpression,
} from "../../types";

import { ConditionalExpression } from "./conditionalExpression";
import { clearExpressionCaches, Expression } from "./expression/expression";

const EVAL_EXPRESSION_CACHES = new LRUCache({ max: 10000 });

export const evalSimpleLayerFeature = (
  layer: LayerSimple,
  feature: Feature,
  interval?: TimeInterval,
): ComputedFeature => {
  const appearances: Partial<LayerAppearanceTypes> = pick(layer, appearanceKeys);
  const nextFeature = evalJsonProperties(layer, feature);
  return {
    ...nextFeature,
    ...evalLayerAppearances(appearances, layer, nextFeature),
    type: "computedFeature",
    interval,
  };
};

export function evalLayerAppearances(
  appearance: Partial<LayerAppearanceTypes>,
  layer: LayerSimple,
  feature?: Feature,
): Partial<AppearanceTypes> {
  if (!feature) {
    if (!layer.id) {
      throw new Error("layer id is required");
    }
    feature = {
      type: "feature",
      id: layer.id,
      properties: layer.properties || {},
    };
  }
  return Object.fromEntries(
    Object.entries(appearance).map(([k, v]) => [
      k,
      Object.fromEntries(
        Object.entries(v).map(([k, v]) => {
          return [k, evalExpression(v, layer, feature)];
        }),
      ),
    ]),
  );
}

export function clearAllExpressionCaches(
  layer: LayerSimple | undefined,
  feature: Feature | undefined,
) {
  const appearances: Partial<LayerAppearanceTypes> = pick(layer, appearanceKeys);

  Object.entries(appearances).forEach(([, v]) => {
    Object.entries(v).forEach(([, expressionContainer]) => {
      if (hasExpression(expressionContainer)) {
        const styleExpression = expressionContainer.expression;
        if (typeof styleExpression === "object" && styleExpression.conditions) {
          styleExpression.conditions.forEach(([expression1, expression2]) => {
            clearExpressionCaches(expression1, feature, layer?.defines);
            clearExpressionCaches(expression2, feature, layer?.defines);
          });
        } else if (typeof styleExpression === "boolean" || typeof styleExpression === "number") {
          clearExpressionCaches(String(styleExpression), feature, layer?.defines);
        } else if (typeof styleExpression === "string") {
          clearExpressionCaches(styleExpression, feature, layer?.defines);
        }
      }
    });
  });
}

function hasExpression(e: any): e is ExpressionContainer {
  return typeof e === "object" && e && "expression" in e;
}

export function getReferences(expression: string): string[] {
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

function evalExpression(
  expressionContainer: any,
  layer: LayerSimple,
  feature?: Feature,
): unknown | undefined {
  try {
    if (hasExpression(expressionContainer)) {
      const styleExpression = expressionContainer.expression;
      if (typeof styleExpression === "undefined") {
        return undefined;
      } else if (typeof styleExpression === "object" && styleExpression.conditions) {
        const properties = pick(feature?.properties, getCombinedReferences(styleExpression));
        const cacheKey = JSON.stringify([styleExpression, properties, layer.defines]);
        if (EVAL_EXPRESSION_CACHES.has(cacheKey)) {
          return EVAL_EXPRESSION_CACHES.get(cacheKey);
        }
        const result = new ConditionalExpression(
          styleExpression,
          feature,
          layer.defines,
        ).evaluate();
        EVAL_EXPRESSION_CACHES.set(cacheKey, result);

        return result;
      } else if (typeof styleExpression === "boolean" || typeof styleExpression === "number") {
        return styleExpression;
      } else if (typeof styleExpression === "string") {
        const cacheKey = JSON.stringify([
          styleExpression,
          pick(feature?.properties, getCombinedReferences(styleExpression)),
          layer.defines,
        ]);
        if (EVAL_EXPRESSION_CACHES.has(cacheKey)) {
          return EVAL_EXPRESSION_CACHES.get(cacheKey);
        }
        const result = new Expression(styleExpression, feature, layer.defines).evaluate();
        EVAL_EXPRESSION_CACHES.set(cacheKey, result);

        return result;
      }
      return styleExpression;
    }
    return expressionContainer;
  } catch (e) {
    console.error(e);
    return;
  }
}

function evalJsonProperties(layer: LayerSimple, feature: Feature): Feature {
  const keys = layer.data?.jsonProperties;
  if (!feature.properties || !keys || !keys.length) {
    return feature;
  }

  const next = {
    ...feature,
    ...(feature?.properties ? { properties: { ...feature.properties } } : {}),
  };
  keys.forEach(k => {
    next.properties[k] = (() => {
      const p = next.properties[k];
      try {
        return JSON.parse(p);
      } catch {
        return p;
      }
    })();
  });

  return next;
}
