import type { ComputedLayer, Layer, PropertyConditions, PropertyLink } from "../../types";

export default async function evaluate(_layer: Layer): Promise<ComputedLayer> {
  throw new Error("wip");
}

export function processProperty(property: any, data: any): any {
  if (typeof property !== "object" || !property) return;

  return Object.fromEntries(
    Object.entries(property).map(([k, v]) =>
      isPropertyConditions(v)
        ? [k, processPropertyConditions(v, data)]
        : isPropertyLink(v)
        ? [k, processPropertyLink(v, data)]
        : [k, v],
    ),
  );
}

function isPropertyConditions(v: any): v is PropertyConditions {
  return typeof v === "object" && v && "conditions" in v && typeof v.conditions === "string";
}

function isPropertyLink(v: any): v is PropertyLink {
  return typeof v === "object" && v && "link" in v && typeof v.link === "object" && v.link;
}

function processPropertyConditions(_cond: PropertyConditions, _data: any): any {
  throw new Error("wip");
}

function processPropertyLink(_link: PropertyLink, _data: any): any {
  throw new Error("wip");
}
