import { URL } from "url";

import { pick } from "lodash-es";

import type { EvalContext, EvalResult } from "..";
import {
  appearanceKeys,
  ComputedFeature,
  Feature,
  LayerAppearanceTypes,
  LayerSimple,
  TimeInterval,
} from "../../types";

import { evalLayerAppearances } from "./eval";
import { evalTimeInterval } from "./interval";

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

  const workerUrl = new URL("./worker.js", import.meta.url);
  const worker = new Worker(workerUrl, { type: "module" });

  const workers = new Array(numWorkers);
  const promises = new Array(numWorkers);

  for (let i = 0; i < numWorkers; i++) {
    const start = i * chunkSize;
    const end = Math.min((i + 1) * chunkSize, features.length);
    const chunk = features.slice(start, end);

    workers[i] = worker;
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

export { evalSimpleLayerFeature, clearAllExpressionCaches } from "./eval";
