import composeRefs from "@seznam/compose-react-refs";
import { Entity as CesiumEntity, PropertyBag } from "cesium";
import { ComponentProps, ForwardedRef, forwardRef, useLayoutEffect, useRef } from "react";
import { CesiumComponentRef, Entity } from "resium";

export type Tag = {
  layerId?: string;
  featureId?: string;
  draggable?: boolean;
  unselectable?: boolean;
  legacyLocationPropertyKey?: string;
};

export const EntityExt = forwardRef(EntityExtComponent);

function EntityExtComponent(
  {
    layerId,
    featureId,
    draggable,
    unselectable,
    legacyLocationPropertyKey,
    ...props
  }: ComponentProps<typeof Entity> & Tag,
  ref: ForwardedRef<CesiumComponentRef<CesiumEntity>>,
) {
  const r = useRef<CesiumComponentRef<CesiumEntity>>(null);

  useLayoutEffect(() => {
    attachTag(r.current?.cesiumElement, {
      layerId: layerId || props.id,
      featureId,
      draggable,
      unselectable,
      legacyLocationPropertyKey,
    });
  }, [draggable, featureId, layerId, legacyLocationPropertyKey, props.id, unselectable]);

  return <Entity ref={composeRefs(ref, r)} {...props} />;
}

function attachTag(entity: CesiumEntity | null | undefined, tag: Tag) {
  if (!entity) return;
  if (!entity.properties) {
    entity.properties = new PropertyBag();
  }
  for (const k of tagKeys) {
    if (!(k in tag)) entity.properties.removeProperty(`reearth_${k}`);
    else entity.properties[`reearth_${k}`] = tag[k];
  }
}

export function getTag(entity: CesiumEntity | null | undefined): Tag | undefined {
  if (!entity?.properties) return;
  return Object.fromEntries(
    Object.entries(entity.properties)
      .map(([k, v]): readonly [PropertyKey, any] | null => {
        if (!tagKeys.includes(k as keyof Tag)) return null;
        return [k.replace("reearth_", ""), v];
      })
      .filter((e): e is readonly [PropertyKey, any] => !!e),
  );
}

const tagObj: { [k in keyof Tag]: 1 } = {
  draggable: 1,
  featureId: 1,
  layerId: 1,
  unselectable: 1,
};

const tagKeys = Object.keys(tagObj) as (keyof Tag)[];
