import type { ComputedLayer, Evaluator, Layer } from "../types";

import SimpleEvaluator from "./simple";

const evaluators: Record<string, Evaluator> = {
  simple: SimpleEvaluator,
};

export default async function evaluate(layer: Layer): Promise<ComputedLayer> {
  return evaluators[layer.type]?.(layer);
}
