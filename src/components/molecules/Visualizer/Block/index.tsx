import React, { ComponentType } from "react";

import { styled } from "@reearth/theme";
import { ValueType, ValueTypes } from "@reearth/util/value";

import Plugin from "../Plugin";
import type { Block, Primitive } from "../Plugin";

import builtin from "./builtin";

export type { Block, Primitive } from "../Plugin";

export type Props<BP = any, PP = any, IP = any, SP = any> = {
  isEditable?: boolean;
  isBuilt?: boolean;
  isSelected?: boolean;
  primitive?: Primitive;
  block?: Block<BP>;
  sceneProperty?: SP;
  infoboxProperty?: IP;
  pluginProperty?: PP;
  pluginBaseUrl?: string;
  onClick?: () => void;
  onChange?: <T extends ValueType>(
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
};

export type Component<BP = any, PP = any, IP = any, SP = any> = ComponentType<
  Props<BP, PP, IP, SP>
>;

export default function BlockComponent<P = any, PP = any, IP = any, SP = any>({
  pluginBaseUrl,
  ...props
}: Props<P, PP, IP, SP>): JSX.Element | null {
  const Builtin =
    props.block?.pluginId && props.block.extensionId
      ? builtin[`${props.block.pluginId}/${props.block.extensionId}`]
      : undefined;

  return Builtin ? (
    <Builtin {...props} />
  ) : (
    <Wrapper editable={props?.isEditable} onClick={props?.onClick} selected={props?.isSelected}>
      <Plugin
        pluginId={props.block?.pluginId}
        extensionId={props.block?.extensionId}
        sourceCode={(props.block as any)?.__REEARTH_SOURCECODE} // for debugging
        extensionType="block"
        pluginBaseUrl={pluginBaseUrl}
        visible
        property={props.pluginProperty}
        sceneProperty={props.sceneProperty}
        pluginProperty={props.pluginProperty}
        primitive={props.primitive}
        block={props.block}
      />
    </Wrapper>
  );
}

const Wrapper = styled.div<{ editable?: boolean; selected?: boolean }>`
  border: 1px solid
    ${({ selected, editable, theme }) =>
      editable && selected ? theme.infoBox.accent2 : "transparent"};
  border-radius: 6px;

  &:hover {
    border-color: ${({ editable, theme }) => (editable ? theme.infoBox.border : null)};
  }
`;
