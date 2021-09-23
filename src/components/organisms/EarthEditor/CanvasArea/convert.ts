import { Item } from "@reearth/components/atoms/ContentPicker";
import { Layer, Widget, Block } from "@reearth/components/molecules/Visualizer";
import {
  GetLayersQuery,
  GetBlocksQuery,
  Maybe,
  MergedPropertyGroupFragmentFragment,
  PropertyItemFragmentFragment,
  MergedPropertyGroupCommonFragmentFragment,
  EarthLayerFragment,
  EarthLayerItemFragment,
  EarthLayer5Fragment,
  GetEarthWidgetsQuery,
  PropertyFragmentFragment,
} from "@reearth/gql";
import { valueFromGQL } from "@reearth/util/value";

type BlockType = Item & {
  pluginId: string;
  extensionId: string;
};

type P = { [key in string]: any };

const processPropertyGroup = (p?: PropertyItemFragmentFragment | null): P | P[] | undefined => {
  if (!p) return;
  if (p.__typename === "PropertyGroupList") {
    return p.groups
      .map(g => processPropertyGroup(g))
      .filter((g): g is P => !!g && !Array.isArray(g));
  }
  if (p.__typename === "PropertyGroup") {
    return p.fields.reduce<P>(
      (a, b) => ({
        ...a,
        [b.fieldId]: valueFromGQL(b.value, b.type)?.value,
      }),
      p.id ? { id: p.id } : {},
    );
  }
  return;
};

export const convertProperty = (p?: PropertyFragmentFragment | null): P | undefined => {
  if (!p) return;
  const items = "items" in p ? p.items : undefined;
  if (!items) return;

  return Array.isArray(items)
    ? items.reduce<any>(
        (a, b) => ({
          ...a,
          [b.schemaGroupId]: processPropertyGroup(b),
        }),
        {},
      )
    : undefined;
};

const processMergedPropertyGroup = (
  p?: MergedPropertyGroupFragmentFragment | MergedPropertyGroupCommonFragmentFragment | null,
): P | P[] | undefined => {
  if (!p) return;
  if ("groups" in p && p.groups.length) {
    return p.groups
      .map(g => processMergedPropertyGroup(g))
      .filter((g): g is P => !!g && !Array.isArray(g));
  }
  if (!p.fields.length) return;
  return p.fields.reduce<P>(
    (a, b) => ({
      ...a,
      [b.fieldId]: valueFromGQL(b.actualValue, b.type)?.value,
    }),
    {},
  );
};

const processMergedProperty = (
  p?: Maybe<NonNullable<EarthLayerItemFragment["merged"]>["property"]>,
): P | undefined => {
  if (!p) return;
  return p.groups.reduce<any>(
    (a, b) => ({
      ...a,
      [b.schemaGroupId]: processMergedPropertyGroup(b),
    }),
    {},
  );
};

const processInfobox = (infobox?: EarthLayerFragment["infobox"]): Layer["infobox"] => {
  if (!infobox) return;
  return {
    property: convertProperty(infobox.property),
    blocks: infobox.fields.map<Block>(f => ({
      id: f.id,
      pluginId: f.pluginId,
      extensionId: f.extensionId,
      property: convertProperty(f.property),
      propertyId: f.propertyId, // required by onBlockChange
    })),
  };
};

const processMergedInfobox = (
  infobox?: Maybe<NonNullable<EarthLayerItemFragment["merged"]>["infobox"]>,
): Layer["infobox"] | undefined => {
  if (!infobox) return;
  return {
    property: processMergedProperty(infobox.property),
    blocks: infobox.fields.map<Block & { propertyId?: string }>(f => ({
      id: f.originalId,
      pluginId: f.pluginId,
      extensionId: f.extensionId,
      property: processMergedProperty(f.property),
      propertyId: f.property?.originalId ?? undefined, // required by onBlockChange
    })),
  };
};

const processLayer = (
  layer: EarthLayer5Fragment | undefined,
  map?: Map<string, Layer>,
): Layer | undefined => {
  if (!layer) return;
  const res: Layer = {
    id: layer.id,
    pluginId: layer.pluginId ?? "",
    extensionId: layer.extensionId ?? "",
    isVisible: layer.isVisible,
    title: layer.name,
    property:
      layer.__typename === "LayerItem" ? processMergedProperty(layer.merged?.property) : undefined,
    infoboxEditable: !!layer.infobox,
    infobox:
      layer.__typename === "LayerItem"
        ? processMergedInfobox(layer.merged?.infobox)
        : processInfobox(layer.infobox),
    children:
      layer.__typename === "LayerGroup"
        ? layer.layers?.map(l => processLayer(l ?? undefined, map)).filter((l): l is Layer => !!l)
        : undefined,
  };
  map?.set(layer.id, res);
  return res;
};

export const convertWidgets = (data: GetEarthWidgetsQuery | undefined): Widget[] | undefined => {
  if (!data || !data.node || data.node.__typename !== "Scene") {
    return undefined;
  }

  const widgets = data.node.widgets
    .filter(w => w.enabled)
    .map(
      (widget): Widget => ({
        id: widget.id,
        pluginId: widget.pluginId,
        extensionId: widget.extensionId,
        property: convertProperty(widget.property),
      }),
    );

  return widgets;
};

export const convertLayers = (
  data: GetLayersQuery | undefined,
): { layer: Layer; map: Map<string, Layer> } | undefined => {
  if (!data || !data.node || data.node.__typename !== "Scene" || !data.node.rootLayer) {
    return undefined;
  }
  const map = new Map<string, Layer>();
  const layer = processLayer(data.node.rootLayer, map);
  return layer
    ? {
        layer,
        map,
      }
    : undefined;
};

export const convertToBlocks = (data?: GetBlocksQuery): BlockType[] | undefined => {
  return (data?.node?.__typename === "Scene" ? data.node.plugins : undefined)
    ?.map(plugin =>
      plugin.plugin?.extensions
        ?.filter(e => e && e.type === "BLOCK")
        .map<BlockType | undefined>(extension =>
          plugin.plugin
            ? {
                id: `${plugin.plugin.id}/${extension.extensionId}`,
                icon:
                  extension.icon ||
                  // for official plugin
                  (plugin.plugin.id === "reearth"
                    ? extension.extensionId.replace(/block$/, "")
                    : ""),
                name: extension.name,
                description: extension.description,
                pluginId: plugin.plugin.id,
                extensionId: extension.extensionId,
              }
            : undefined,
        )
        .filter((b): b is BlockType => !!b),
    )
    .filter((a): a is BlockType[] => !!a)
    .reduce((a, b) => [...a, ...b], []);
};
