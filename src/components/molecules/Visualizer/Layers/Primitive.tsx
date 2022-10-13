import { ComponentType, useMemo } from "react";

import type { SceneProperty } from "../Engine";
import type { ComputedFeature, Geometry, FeatureComponentProps, ComputedLayer } from "../next";
import { useContext, type Layer as LegacyLayer } from "../Plugin";
import { mergeProperty, compatProperty } from "../utils";

export type Props<P = any> = {
  id: string;
  property: P;
  isVisible?: boolean;
  layer?: ComputedLayer;
  feature?: ComputedFeature;
  geometry?: Geometry;
} & Omit<FeatureComponentProps, "layer">;

export type Component<P = any> = ComponentType<Props<P>>;
export type Layer = LegacyLayer;

export default function PrimitiveComponent({
  isHidden,
  overriddenProperties,
  layer,
  ...props
}: {
  layer: LegacyLayer;
  overriddenProperties?: { [id in string]: any };
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  isHidden?: boolean;
  sceneProperty?: SceneProperty;
}) {
  const ctx = useContext();
  const actualProperty = useMemo(
    () =>
      compatProperty(
        layer?.property && overriddenProperties?.[layer.id]
          ? mergeProperty(layer.property, overriddenProperties[layer.id])
          : layer?.property,
      ),
    [overriddenProperties, layer],
  );

  const Builtin = useMemo(() => {
    const builtin = ctx?.engine?.builtinPrimitives;
    return layer.extensionId ? builtin?.[layer.extensionId] : undefined;
  }, [ctx, layer?.extensionId]);

  return isHidden || !layer?.isVisible ? null : Builtin ? (
    <Builtin {...props} id={layer.id} isVisible={layer.isVisible} property={actualProperty} />
  ) : null;
}
