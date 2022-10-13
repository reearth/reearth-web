import { atom, useAtomValue } from "jotai";
import { merge, omit } from "lodash";
import {
  ForwardedRef,
  useCallback,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

import { objectFromGetter } from "@reearth/util/object";

import { computeAtom, type Atom } from "../../atoms";
import { convertLegacyLayer } from "../../compat";
import type { ComputedLayer, Layer, NaiveLayer } from "../../types";

import { computedLayerKeys, layerKeys } from "./keys";

export type { Layer, NaiveLayer } from "../../types";

/**
 * Same as a Layer, but all fields except id is lazily evaluated,
 * in order to reduce unnecessary sending and receiving of data to and from
 * QuickJS (a plugin runtime) and to improve performance.
 */
export type LazyLayer = Readonly<Layer> & {
  computed?: Readonly<ComputedLayer>;
};

export type Ref = {
  findById: (id: string) => LazyLayer | undefined;
  findByIds: (...ids: string[]) => (LazyLayer | undefined)[];
  add: (layer: NaiveLayer) => LazyLayer | undefined;
  addAll: (...layers: NaiveLayer[]) => (LazyLayer | undefined)[];
  replace: (...layers: Layer[]) => void;
  override: (id: string, layer?: Partial<Layer> | null) => void;
  deleteLayer: (...ids: string[]) => void;
  isLayer: (obj: any) => obj is LazyLayer;
  walk: <T>(
    fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => T | void,
  ) => T | undefined;
  find: (
    fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean,
  ) => LazyLayer | undefined;
  findAll: (fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean) => LazyLayer[];
  findByTags: (...tagIds: string[]) => LazyLayer[];
  findByTagLabels: (...tagLabels: string[]) => LazyLayer[];
};

export default function useHooks({ layers, ref }: { layers?: Layer[]; ref?: ForwardedRef<Ref> }) {
  const layerMap = useMemo(() => new Map<string, Layer>(), []);
  const [overriddenLayers, setOverridenLayers] = useState<Omit<Layer, "type" | "children">[]>([]);
  const atomsMap = useMemo(() => new Map<string, Atom>(), []);
  const lazyLayerMap = useMemo(() => new Map<string, LazyLayer>(), []);

  const [tempLayers, setTempLayers] = useState<Layer[]>([]);
  const flattenedLayers = useMemo((): Layer[] => {
    const newLayers = [...flattenLayers(tempLayers), ...flattenLayers(layers ?? [])];
    // apply overrides
    return newLayers.map(l => {
      const ol: any = overriddenLayers.find(ll => ll.id === l.id);
      if (!ol) return l;

      // prevents unnecessary copying of data value
      const dataValue = ol.data?.value ?? (l.type === "simple" ? l.data?.value : undefined);
      const res = merge(
        {},
        {
          ...l,
          ...(l.type === "simple" && l.data ? { data: omit(l.data, "value") } : {}),
        },
        { ...ol, ...(ol.data ? { data: omit(ol.data, "value") } : {}) },
      );

      if (dataValue && res.data) {
        res.data.value = dataValue;
      }

      return res;
    });
  }, [layers, tempLayers, overriddenLayers]);

  const getComputedLayer = useAtomValue(
    useMemo(
      () =>
        atom(get => (layerId: string) => {
          const atoms = atomsMap.get(layerId);
          if (!atoms) return;
          const cl = get(atoms);
          return cl;
        }),
      [atomsMap],
    ),
  );

  const lazyComputedLayerPrototype = useMemo<object>(() => {
    return objectFromGetter(
      // id and layer should not be accessible
      computedLayerKeys,
      function (key) {
        const id: string | undefined = (this as any).id;
        if (!id || typeof id !== "string") throw new Error("layer ID is not specified");

        const layer = getComputedLayer(id);
        if (!layer) return undefined;
        return (layer as any)[key];
      },
    );
  }, [getComputedLayer]);

  const lazyLayerPrototype = useMemo<object>(() => {
    return objectFromGetter(layerKeys, function (key) {
      const id: string | undefined = (this as any).id;
      if (!id || typeof id !== "string") throw new Error("layer ID is not specified");

      const layer = layerMap.get(id);
      if (!layer) return undefined;

      // compat
      if (key === "pluginId") return layer.compat?.extensionId ? "reearth" : undefined;
      else if (key === "extensionId") return layer.compat?.extensionId;
      else if (key === "property") return layer.compat?.property;
      else if (key === "propertyId") return layer.compat?.propertyId;
      else if (key === "isVisible") return layer.visible;
      // computed
      else if (key === "computed") {
        const computedLayer = getComputedLayer(layer.id);
        if (!computedLayer) return undefined;
        const computed = Object.create(lazyComputedLayerPrototype);
        computed.id = id;
        return computed;
      }

      return (layer as any)[key];
    });
  }, [getComputedLayer, layerMap, lazyComputedLayerPrototype]);

  const findById = useCallback(
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

  const findByIds = useCallback(
    (...ids: string[]): (LazyLayer | undefined)[] => {
      return ids.map(id => findById(id));
    },
    [findById],
  );

  const add = useCallback(
    (layer: NaiveLayer): LazyLayer | undefined => {
      if (!isValidLayer(layer)) return;

      const rawLayer = compat(layer);
      if (!rawLayer) return;

      const newLayer = { ...rawLayer, id: uuidv4() };

      // generate ids for layers and blocks
      walkLayers([newLayer], l => {
        if (!l.id) {
          l.id = uuidv4();
        }
        l.infobox?.blocks?.forEach(b => {
          if (b.id) return;
          b.id = uuidv4();
        });
        layerMap.set(l.id, l);
        atomsMap.set(l.id, computeAtom());
      });

      setTempLayers(layers => [...layers, newLayer]);

      const newLazyLayer = findById(newLayer.id);
      if (!newLazyLayer) throw new Error("layer not found");

      return newLazyLayer;
    },
    [atomsMap, findById, layerMap],
  );

  const addAll = useCallback(
    (...layers: NaiveLayer[]): (LazyLayer | undefined)[] => {
      return layers.map(l => add(l));
    },
    [add],
  );

  const replace = useCallback(
    (...layers: Layer[]) => {
      const validLayers = layers
        .filter(isValidLayer)
        .map(compat)
        .filter((l): l is Layer => !!l);
      setTempLayers(currentLayers => {
        replaceLayers(currentLayers, l => {
          const newLayer = validLayers.find(ll => ll.id === l.id);
          if (newLayer) {
            const newLayer2 = { ...newLayer };
            layerMap.set(newLayer.id, newLayer2);

            return newLayer2;
          }
          return;
        });
        return [...currentLayers];
      });
    },
    [layerMap],
  );

  const override = useCallback(
    (id: string, layer?: Partial<Layer> | null) => {
      if (!layer) {
        setOverridenLayers(layers => layers.filter(l => l.id !== id));
        return;
      }

      const originalLayer = layerMap.get(id);
      if (!originalLayer) return;

      const rawLayer = compat({
        ...layer,
        ...(originalLayer.compat && "property" in layer
          ? {
              type: originalLayer.type === "group" ? "group" : "item",
              extensionId: originalLayer.compat.extensionId,
            }
          : {}),
      });
      if (!rawLayer) return;
      const layer2 = { id, ...omit(rawLayer, "id", "type", "children", "compat") };
      setOverridenLayers(layers => {
        const i = layers.findIndex(l => l.id === id);
        if (i < 0) return [...layers, layer2];
        return [...layers.slice(0, i - 1), layer2, ...layers.slice(i + 1)];
      });
    },
    [layerMap],
  );

  const deleteLayer = useCallback(
    (...ids: string[]) => {
      setTempLayers(layers => {
        const deleted: Layer[] = [];
        const newLayers = filterLayers(layers, l => {
          if (ids.includes(l.id)) {
            deleted.push(l);
            return false;
          }
          return true;
        });
        deleted
          .map(l => l.id)
          .forEach(id => {
            layerMap.delete(id);
            atomsMap.delete(id);
            lazyLayerMap.delete(id);
          });
        return newLayers;
      });
    },
    [layerMap, atomsMap, lazyLayerMap],
  );

  const isLayer = useCallback(
    (obj: any): obj is LazyLayer => {
      return typeof obj === "object" && Object.getPrototypeOf(obj) === lazyLayerPrototype;
    },
    [lazyLayerPrototype],
  );

  const walk = useCallback(
    <T>(fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => T | void): T | undefined => {
      return walkLayers(layers ?? [], (l, i, p) => {
        const ll = findById(l.id);
        if (!ll) return;
        return fn(
          ll,
          i,
          p.map(l => findById(l.id)).filter((l): l is LazyLayer => !!l),
        );
      });
    },
    [findById, layers],
  );

  const find = useCallback(
    (
      fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean,
    ): LazyLayer | undefined => {
      return walk((...args) => (fn(...args) ? args[0] : undefined));
    },
    [walk],
  );

  const findAll = useCallback(
    (fn: (layer: LazyLayer, index: number, parents: LazyLayer[]) => boolean): LazyLayer[] => {
      const res: LazyLayer[] = [];
      walk((...args) => {
        if (fn(...args)) res.push(args[0]);
      });
      return res;
    },
    [walk],
  );

  const findByTags = useCallback(
    (...tagIds: string[]): LazyLayer[] => {
      return findAll(
        l =>
          !!l.tags?.some(
            t => tagIds.includes(t.id) || !!t.tags?.some(tt => tagIds.includes(tt.id)),
          ),
      );
    },
    [findAll],
  );

  const findByTagLabels = useCallback(
    (...tagLabels: string[]): LazyLayer[] => {
      return findAll(
        l =>
          !!l.tags?.some(
            t => tagLabels.includes(t.label) || !!t.tags?.some(tt => tagLabels.includes(tt.label)),
          ),
      );
    },
    [findAll],
  );

  useImperativeHandle(
    ref,
    () => ({
      findById,
      add,
      addAll,
      replace,
      override,
      deleteLayer,
      findByIds,
      isLayer,
      walk,
      find,
      findAll,
      findByTags,
      findByTagLabels,
    }),
    [
      findById,
      add,
      addAll,
      replace,
      override,
      deleteLayer,
      findByIds,
      isLayer,
      walk,
      find,
      findAll,
      findByTags,
      findByTagLabels,
    ],
  );

  useLayoutEffect(() => {
    const ids = new Set<string>();

    walkLayers(layers ?? [], l => {
      ids.add(l.id);
      if (!atomsMap.has(l.id)) {
        atomsMap.set(l.id, computeAtom());
      }
      layerMap.set(l.id, l);
    });

    const deleted = Array.from(atomsMap.keys()).filter(k => !ids.has(k));
    deleted.forEach(k => {
      atomsMap.delete(k);
      layerMap.delete(k);
      lazyLayerMap.delete(k);
    });
    setOverridenLayers(layers => layers.filter(l => !deleted.includes(l.id)));
  }, [atomsMap, layers, layerMap, lazyLayerMap, setOverridenLayers]);

  return { atomsMap, flattenedLayers };
}

function flattenLayers(layers: Layer[]): Layer[] {
  return layers.flatMap(l =>
    l.type === "group" && Array.isArray(l.children) ? flattenLayers(l.children) : [l],
  );
}

function walkLayers<T>(
  layers: Layer[],
  cb: (layer: Layer, i: number, parent: Layer[]) => T | void,
): T | undefined {
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    const res = cb(l, i, layers);
    if (typeof res !== "undefined") {
      return res;
    }
    if (l.type === "group" && Array.isArray(l.children)) {
      const res = walkLayers(l.children, cb);
      if (typeof res !== "undefined") {
        return res;
      }
    }
  }
  return;
}

function replaceLayers(
  layers: Layer[],
  cb: (layer: Layer, i: number, parent: Layer[]) => Layer | void,
): Layer[] {
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    const nl = cb(l, i, layers);
    if (nl) {
      layers[i] = nl;
    }
    if (l.type === "group" && Array.isArray(l.children)) {
      l.children = replaceLayers(l.children, cb);
    }
  }
  return layers;
}

function filterLayers(
  layers: Layer[],
  cb: (layer: Layer, i: number, parent: Layer[]) => boolean,
): Layer[] {
  const newLayers: Layer[] = [];
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    if (cb(l, i, layers)) {
      newLayers.push(l);
    }
    if (l.type === "group" && Array.isArray(l.children)) {
      l.children = filterLayers(l.children, cb);
    }
  }
  return newLayers;
}

function isValidLayer(l: unknown): l is Layer {
  return !!l && typeof l === "object" && ("type" in l || "extensionId" in l);
}

function compat(layer: unknown): Layer | undefined {
  if (!layer || typeof layer !== "object") return;
  return "extensionId" in layer || "property" in layer
    ? convertLegacyLayer(layer as any)
    : (layer as Layer);
}
