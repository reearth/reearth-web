import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import { objectFromGetter } from "@reearth/util/object";

import type { LayerSimple, Layer, LayerGroup } from "../types";

import { createAtoms, type Atoms } from "./hooks";
import LayerComponent, { type CommonProps, type Props as LayerProps } from "./Layer";

export type { LayerSimple, Layer, CommonProps, FeatureComponentProps } from "./Layer";

// Layer type used for plugin APIs
export type LazyLayer = { type: LayerSimple["type"] | LayerGroup["type"] } & Omit<
  LayerSimple,
  "type"
> &
  Omit<LayerGroup, "type">;

export type Props = {
  layers?: Layer[];
  overriddenProperties?: Record<string, Record<string, any>>;
  Feature?: LayerProps["Feature"];
} & CommonProps;

export type Ref = {
  getLayer: (id: string) => LazyLayer | undefined;
  addLayer: (...layers: Layer[]) => void;
  updateLayer: (...layers: Layer[]) => void;
  deleteLayer: (...ids: string[]) => void;
};

const Layers: React.ForwardRefRenderFunction<Ref, Props> = (
  { layers, overriddenProperties, ...props },
  ref,
) => {
  const layerMap = useMemo(() => new Map<string, Layer>(), []);
  const atomsMap = useMemo(() => new Map<string, Atoms>(), []);
  const lazyLayerMap = useMemo(() => new Map<string, LazyLayer>(), []);

  const [tempLayers, setTempLayers] = useState<Layer[]>([]);
  const allFLayers = useMemo(
    (): LayerSimple[] => [...flattenLayers(tempLayers), ...flattenLayers(layers ?? [])],
    [layers, tempLayers],
  );

  const lazyLayerPrototype = useMemo(() => {
    return objectFromGetter<Omit<LazyLayer, "id">>(layerKeys, function (key) {
      const id: string | undefined = (this as any).id;
      if (!id) throw new Error("layer ID is not specified");
      return (layerMap.get(id) as any)?.[key];
    });
  }, [layerMap]);

  const getLayer = useCallback(
    (id: string): LazyLayer | undefined => {
      const lazyLayer = lazyLayerMap.get(id);
      if (lazyLayer) return lazyLayer;

      if (!layerMap.has(id)) return;

      const l = Object.create(lazyLayerPrototype);
      l.id = id;
      lazyLayerMap.set(id, l);

      return l;
    },
    [layerMap, lazyLayerMap, lazyLayerPrototype],
  );

  const addLayer = useCallback(
    (...layers: Layer[]) => {
      for (const layer of layers) {
        if (layerMap.has(layer.id)) continue;
        setTempLayers(layers => [...layers, layer]);
        layerMap.set(layer.id, layer);
        atomsMap.set(layer.id, createAtoms());
      }
    },
    [atomsMap, layerMap],
  );

  const updateLayer = useCallback(
    (...layers: Layer[]) => {
      for (const layer of layers) {
        if (!layerMap.has(layer.id)) continue;
        layerMap.set(layer.id, layer);
        setTempLayers(layers => {
          const i = layers.findIndex(l => l.id == layer.id);
          if (i <= 0) return layers;

          return [...layers.slice(0, i), layer, ...layers.slice(i + 1)];
        });
      }
    },
    [layerMap],
  );

  const deleteLayer = useCallback(
    (...ids: string[]) => {
      setTempLayers(layers => layers.filter(l => !ids.includes(l.id)));
      ids.forEach(id => {
        layerMap.delete(id);
        atomsMap.delete(id);
        lazyLayerMap.delete(id);
      });
    },
    [atomsMap, layerMap, lazyLayerMap],
  );

  useImperativeHandle(ref, () => ({
    getLayer,
    addLayer,
    updateLayer,
    deleteLayer,
  }));

  useLayoutEffect(() => {
    const ids = new Set<string>();

    walkLayers(layers ?? [], l => {
      ids.add(l.id);
      if (!atomsMap.has(l.id)) {
        atomsMap.set(l.id, createAtoms());
      }
      layerMap.set(l.id, l);
    });

    for (const k of atomsMap.keys()) {
      if (!ids.has(k)) {
        atomsMap.delete(k);
        layerMap.delete(k);
        lazyLayerMap.delete(k);
      }
    }
  }, [atomsMap, layers, layerMap, lazyLayerMap]);

  return (
    <>
      {allFLayers?.map(layer => (
        <LayerComponent
          key={layer.id}
          {...props}
          layer={layer}
          atoms={atomsMap.get(layer.id)}
          overriddenProperties={overriddenProperties?.[layer.id]}
        />
      ))}
    </>
  );
};

// Do not forget to update layerKeys when Layer type was updated
const layerKeys: (keyof Omit<LazyLayer, "id">)[] = [
  "children",
  "data",
  "hidden",
  "infobox",
  "marker",
  "properties",
  "tags",
  "title",
  "type",
];

function flattenLayers(layers: Layer[]): LayerSimple[] {
  return layers.flatMap(l => (l.type === "group" ? flattenLayers(l.children) : [l]));
}

function walkLayers(layers: Layer[], cb: (layer: Layer) => void) {
  layers.forEach(l => {
    cb(l);
    if (l.type === "group") {
      walkLayers(l.children, cb);
    }
  });
}

export default forwardRef(Layers);
