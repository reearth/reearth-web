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

import { computeAtom, type Atoms } from "../../atoms";
import type { Layer, NaiveLayer } from "../../types";

/**
 * Same as a Layer, but all fields except id is lazily evaluated,
 * in order to reduce unnecessary sending and receiving of data to and from
 * QuickJS (a plugin runtime) and to improve performance.
 */
export type LazyLayer = Readonly<Layer> & { __REEARTH_LAZY_LAYER: never };

export type Ref = {
  findById: (id: string) => LazyLayer | undefined;
  findByIds: (...ids: string[]) => (LazyLayer | undefined)[];
  add: (layer: NaiveLayer) => LazyLayer;
  update: (...layers: Layer[]) => void;
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
  const atomsMap = useMemo(() => new Map<string, Atoms>(), []);
  const lazyLayerMap = useMemo(() => new Map<string, LazyLayer>(), []);

  const [tempLayers, setTempLayers] = useState<Layer[]>([]);
  const flattenedLayers = useMemo(
    (): Layer[] => [...flattenLayers(tempLayers), ...flattenLayers(layers ?? [])],
    [layers, tempLayers],
  );

  const lazyLayerPrototype = useMemo<object>(() => {
    return objectFromGetter(layerKeys, function (key) {
      const id: string | undefined = (this as any).id;
      if (!id) throw new Error("layer ID is not specified");

      if (key === "pluginId") return "reearth";

      const layer = layerMap.get(id);
      if (!layer) return undefined;

      if (key === "pluginId") return "reearth";
      else if (key === "extensionId") return layer.compat?.extensionId;
      else if (key === "property") return layer.compat?.property;
      else if (key === "propertyId") return layer.compat?.propertyId;
      else if (key === "isVisible" || key === "visible") return !layer.hidden;

      return (layer as any)[key];
    });
  }, [layerMap]);

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
    (layer: NaiveLayer): LazyLayer => {
      const newLayer = { ...layer, id: uuidv4() } as Layer;

      // generate ids for layers and blocks
      walkLayers([newLayer], l => {
        if (!l.id) {
          l.id = uuidv4();
        }
        l.infobox?.blocks?.forEach(b => {
          if (b.id) return;
          b.id = uuidv4();
        });
      });

      setTempLayers(layers => [...layers, newLayer]);
      layerMap.set(newLayer.id, newLayer);
      atomsMap.set(newLayer.id, computeAtom());

      const newLazyLayer = findById(newLayer.id);
      if (!newLazyLayer) throw new Error("layer not found");

      return newLazyLayer;
    },
    [atomsMap, findById, layerMap],
  );

  const update = useCallback(
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
      update,
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
      add,
      deleteLayer,
      find,
      findAll,
      findByTagLabels,
      findByTags,
      findById,
      findByIds,
      isLayer,
      update,
      walk,
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

    for (const k of atomsMap.keys()) {
      if (!ids.has(k)) {
        atomsMap.delete(k);
        layerMap.delete(k);
        lazyLayerMap.delete(k);
      }
    }
  }, [atomsMap, layers, layerMap, lazyLayerMap]);

  return { atomsMap, flattenedLayers };
}

type KeysOfUnion<T> = T extends T ? keyof T : never;
type Element<T> = T extends (infer E)[] ? E : never;
const legacyLayerKeys = [
  "property",
  "propertyId",
  "pluginId",
  "extensionId",
  "isVisible",
  "visible",
];

// Do not forget to update layerKeys when Layer type was updated
const layerKeys: (KeysOfUnion<Layer> | Element<typeof legacyLayerKeys>)[] = [
  "children",
  "data",
  "hidden",
  "infobox",
  "marker",
  "properties",
  "tags",
  "title",
  "type",
  "creator",
  // "compat" should not be read from plugins
  ...legacyLayerKeys,
];

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
