import type { TreeLayer, Layer } from "./types";

export function flattenLayers(layers: TreeLayer[] | undefined): Layer[] | undefined {
  return layers?.flatMap(l => ("children" in l ? flattenLayers(l.children) ?? [] : [l]));
}
