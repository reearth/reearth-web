import { pick } from "lodash-es";

import type { EvalContext, EvalResult } from "..";
import {
  appearanceKeys,
  AppearanceTypes,
  ConditionsExpression,
  Feature,
  LayerAppearanceTypes,
  LayerSimple,
  StyleExpression,
} from "../../types";
import { defined } from "../../utils";

import { ConditionalExpression, Expression } from "./expression";

export async function evalSimpleLayer(
  layer: LayerSimple,
  ctx: EvalContext,
): Promise<EvalResult | undefined> {
  const features = layer.data ? await ctx.getAllFeatures(layer.data) : undefined;
  const appearances: Partial<LayerAppearanceTypes> = pick(layer, appearanceKeys);
  return {
    layer: evalLayerAppearances(appearances, layer),
    features: features?.map(f => ({ ...f, ...evalLayerAppearances(appearances, layer, f) })),
  };
}

export function evalLayerAppearances(
  appearance: Partial<LayerAppearanceTypes>,
  layer: LayerSimple,
  feature?: Feature,
): Partial<AppearanceTypes> {
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

function evalExpression(
  styleExpression: StyleExpression,
  layer: LayerSimple,
  feature?: Feature,
): unknown {
  if (!defined(styleExpression)) {
    return undefined;
  } else if (typeof styleExpression === "object" && styleExpression.conditions) {
    return new ConditionalExpression(styleExpression as ConditionsExpression, feature).evaluate();
  } else if (typeof styleExpression === "boolean" || typeof styleExpression === "number") {
    return new Expression(String(styleExpression), feature).evaluate();
  } else if (typeof styleExpression === "string") {
    return new Expression(styleExpression, feature).evaluate();
  }
  return styleExpression;
}
