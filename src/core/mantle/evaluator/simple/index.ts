import { defined } from "cesium";
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
  _styleExpression: StyleExpression,
  _layer: LayerSimple,
  _feature?: Feature,
): unknown {
  if (!defined(_styleExpression)) {
    return undefined;
  } else if (typeof _styleExpression === "object" && _styleExpression.conditions) {
    return new ConditionalExpression(_styleExpression as ConditionsExpression, _feature).evaluate();
  } else if (typeof _styleExpression === "boolean" || typeof _styleExpression === "number") {
    return new Expression(String(_styleExpression), _feature).evaluate();
  } else if (typeof _styleExpression === "string") {
    return new Expression(_styleExpression, _feature).evaluate();
  }
  return _styleExpression;
}
