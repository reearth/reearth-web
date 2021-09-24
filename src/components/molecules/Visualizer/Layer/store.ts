import type { Layer } from "../Primitive";

export default class LayerStore {
  constructor(root: Layer) {
    this.#root = this.#layer(root);
    this.#flattenLayers = flattenLayers(root?.children ?? []);
    this.#map = new Map(this.#flattenLayers.map(l => [l.id, this.#layer(l)]));
  }

  #root: Layer;
  #flattenLayers: Layer[];
  #map: Map<string, Layer>;

  #layer(layer: Layer): Layer {
    // use getter and setter
    return layer;
  }

  findById(id: string): Layer | undefined {
    return this.#map.get(id);
  }

  findByIds(...ids: string[]): (Layer | undefined)[] {
    return ids.map(id => this.findById(id));
  }

  get root(): Layer {
    return this.#root;
  }

  get flattenLayers(): Layer[] {
    return this.#flattenLayers;
  }
}

function flattenLayers(layers: Layer[] | undefined): Layer[] {
  return (
    layers?.reduce<Layer[]>((a, b) => [...a, ...(b.isVisible ? b.children ?? [b] : [])], []) ?? []
  );
}

export const empty = new LayerStore({ id: "" });
