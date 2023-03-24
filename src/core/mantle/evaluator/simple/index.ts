import { pick } from "lodash-es";
import LRUCache from "lru-cache";

import type { EvalContext, EvalResult } from "..";
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
import { clearExpressionCaches, Expression } from "./expression";
import { evalTimeInterval } from "./interval";

// const EVAL_EXPRESSION_CACHES: Map<string, any> = new Map();

export async function evalSimpleLayer(
  layer: LayerSimple,
  ctx: EvalContext,
): Promise<EvalResult | undefined> {
  const features = layer.data ? await ctx.getAllFeatures(layer.data) : undefined;
  const appearances: Partial<LayerAppearanceTypes> = pick(layer, appearanceKeys);
  const timeIntervals = evalTimeInterval(features, layer.data?.time);

  if (!features) {
    return undefined;
  }

  const featureResults = await evalFeaturesInWorker(features, layer, timeIntervals);

  return {
    layer: evalLayerAppearances(appearances, layer),
    features: featureResults,
  };
}

async function evalFeaturesInWorker(
  features: Feature[],
  layer: LayerSimple,
  timeIntervals: TimeInterval[] | void,
): Promise<ComputedFeature[]> {
  const numWorkers = navigator.hardwareConcurrency || 1;
  const chunkSize = Math.ceil(features.length / numWorkers);

  const workerScript = `
    self.addEventListener('message', event => {
      const { features, layer, timeIntervals } = event.data;
      const results = features.map((f, i) => {
        const computedFeature = evalSimpleLayerFeature(layer, f, timeIntervals?.[i]);
        return computedFeature;
      });
      self.postMessage(results);
    });
  `;

  const workerBlob = new Blob([workerScript], { type: "text/javascript" });
  const workerUrl = URL.createObjectURL(workerBlob);

  const workers = new Array(numWorkers);
  const promises = new Array(numWorkers);

  for (let i = 0; i < numWorkers; i++) {
    const start = i * chunkSize;
    const end = Math.min((i + 1) * chunkSize, features.length);
    const chunk = features.slice(start, end);

    workers[i] = new Worker(workerUrl);
    promises[i] = new Promise(resolve => {
      workers[i].addEventListener("message", (event: { data: any }) => {
        const featureResults = event.data;
        workers[i].terminate();
        resolve(featureResults);
      });
    });

    workers[i].postMessage({ features: chunk, layer, timeIntervals });
  }

  const results = await Promise.all(promises);
  return Array.prototype.concat(...results);
}

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

// Create an LRU EVAL_EXPRESSION_CACHES with a maximum size of 10,000 entries
const EVAL_EXPRESSION_CACHES = new LRUCache({ max: 10000 });

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
          // Return the cached result if it exists in the EVAL_EXPRESSION_CACHES
          return EVAL_EXPRESSION_CACHES.get(cacheKey);
        }

        // Otherwise, evaluate the expression and store the result in the EVAL_EXPRESSION_CACHES
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
          // Return the cached result if it exists in the EVAL_EXPRESSION_CACHES
          return EVAL_EXPRESSION_CACHES.get(cacheKey);
        }

        // Otherwise, evaluate the expression and store the result in the EVAL_EXPRESSION_CACHES
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
