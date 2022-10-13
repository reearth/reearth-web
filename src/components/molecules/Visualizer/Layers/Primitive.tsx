import { ComponentType, useMemo } from "react";

import type { SceneProperty } from "../Engine";
import { useContext } from "../Plugin";
import type { Layer } from "../Plugin";
import { mergeProperty, compatProperty } from "../utils";

export type { Layer } from "../Plugin";

export type Props<P = any> = {
  id: string;
  property: P;
  isVisible?: boolean;
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  isHidden?: boolean;
  sceneProperty?: SceneProperty;
  overriddenProperties?: { [id in string]: any };
};

export type Component<P = any> = ComponentType<Props<P>>;

export default function PrimitiveComponent<P = any>({
  isHidden,
  overriddenProperties,
  layer,
  ...props
}: Omit<Props<P>, "id" | "property" | "isVisible"> & { layer: Layer }) {
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
    return layer?.pluginId && layer.extensionId
      ? builtin?.[`${layer.pluginId}/${layer.extensionId}`]
      : undefined;
  }, [ctx, layer?.extensionId, layer?.pluginId]);

  return isHidden || !layer?.isVisible ? null : Builtin ? (
    <Builtin {...props} id={layer.id} isVisible={layer.isVisible} property={actualProperty} />
  ) : null;
}
