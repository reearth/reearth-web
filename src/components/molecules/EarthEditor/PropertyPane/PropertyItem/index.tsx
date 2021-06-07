import React, { useState, useMemo, useCallback } from "react";
import { useIntl } from "react-intl";
import { mapValues } from "lodash-es";

import { styled } from "@reearth/theme";
import { ExtendedFuncProps2 } from "@reearth/types";
import { useBind } from "@reearth/util/use-bind";
import { partitionObject } from "@reearth/util/util";
import { zeroValues } from "@reearth/util/value";

import GroupWrapper from "@reearth/components/atoms/PropertyGroup";
import PropertyList, { Item as PropertyListItem } from "../PropertyList";
import PropertyField, {
  Props as FieldProps,
  Field as FieldType,
  ValueType as ValueTypeType,
  ValueTypes as ValueTypesType,
  LatLng as LatLngType,
  SchemaField as SchemaFieldType,
  Asset as AssetType,
} from "../PropertyField";
import Button from "@reearth/components/atoms/Button";
import Modal from "@reearth/components/atoms/Modal";
import Icon from "@reearth/components/atoms/Icon";
import { metricsSizes } from "@reearth/theme/metrics";

export type {
  Dataset,
  DatasetSchema,
  DatasetField,
  DatasetType,
  Location,
  Layer,
} from "../PropertyField";

export type Field = FieldType;

export type SchemaField<T extends ValueType = ValueType> = SchemaFieldType<T> & {
  only?: {
    field: string;
    value: string | boolean;
  };
};
export type ValueType = ValueTypeType;
export type ValueTypes = ValueTypesType;
export type LatLng = LatLngType;
export type Asset = AssetType;

export type ItemCommon = {
  id?: string;
  schemaGroup: string;
  title?: string;
  schemaFields: SchemaField[];
  nameField?: string;
  only?: {
    field: string;
    value: string | boolean;
  };
};

export type GroupList = {
  items: GroupListItem[];
} & ItemCommon;

export type GroupListItem = {
  id: string;
  fields: Field[];
};

export type Group = {
  fields: Field[];
} & ItemCommon;

export type Item = Group | GroupList;

export type Props = {
  className?: string;
  item?: Item;
  title?: string;
  group?: boolean;
  defaultItemName?: string;
  onItemAdd?: (schemaGroupId: string) => void;
  onItemMove?: (schemaGroupId: string, itemId: string, from: number, to: number) => void;
  onItemRemove?: (schemaGroupId: string, itemId: string, index: number) => void;
  onRemovePane?: () => void;
  onItemsUpdate?: (
    schemaGroupId: string,
    items: {
      itemId?: string;
      layerId?: string;
      from: number;
      to: number;
    }[],
  ) => void;
} & Pick<
  FieldProps,
  | "datasetSchemas"
  | "isDatasetLinkable"
  | "linkedDatasetSchemaId"
  | "linkedDatasetId"
  | "isCapturing"
  | "onIsCapturingChange"
  | "camera"
  | "onCameraChange"
  | "notLinkable"
  | "onDatasetPickerOpen"
  | "layers"
  | "assets"
  | "onCreateAsset"
> &
  ExtendedFuncProps2<
    Pick<
      FieldProps,
      "onChange" | "onRemove" | "onLink" | "onUnlink" | "onUploadFile" | "onRemoveFile"
    >,
    string,
    string | undefined
  >;

const PropertyItem: React.FC<Props> = ({
  className,
  item,
  title,
  group,
  defaultItemName,
  onItemAdd,
  onItemMove,
  onItemRemove,
  onItemsUpdate,
  onRemovePane,
  ...props
}) => {
  const [eventProps, otherProps] = partitionObject(props, [
    "onChange",
    "onRemove",
    "onLink",
    "onUnlink",
    "onUploadFile",
    "onRemoveFile",
  ]);
  const intl = useIntl();

  const [selected, select] = useState(-1);
  const [openModal, setModal] = useState(false);

  const isList = item && "items" in item;
  const layerMode = useMemo(() => {
    if (!isList || !item?.nameField) return false;
    const sf = item.schemaFields.find(f => f.id === item.nameField);
    return sf?.type === "ref" && sf.ui === "layer";
  }, [isList, item?.nameField, item?.schemaFields]);

  const groups = useMemo<(GroupListItem | Group)[]>(
    () => (item && "items" in item ? item.items : item ? [item] : []),
    [item],
  );

  const selectedItem = isList ? groups[selected] : groups[0];
  const propertyListItems = useMemo(
    () =>
      groups
        .map<PropertyListItem | undefined>(i => {
          if (!i.id) return;

          const nameField = item?.nameField
            ? i.fields.find(f => f.id === item.nameField)
            : undefined;
          const nameSchemaField = item?.schemaFields?.find(sf => sf.id === item.nameField);

          const value = nameField?.value || nameSchemaField?.defaultValue;

          const choice = nameSchemaField?.choices
            ? nameSchemaField?.choices?.find(c => c.key === value)?.label
            : undefined;

          const title = valueToString(choice || value);

          return {
            id: i.id,
            title: layerMode ? undefined : title,
            layerId: layerMode ? title : undefined,
          };
        })
        .filter((g): g is PropertyListItem => !!g),
    [groups, layerMode, item],
  );
  const schemaFields = useMemo(
    () =>
      selectedItem
        ? item?.schemaFields.map(f => {
            const events = mapValues(eventProps, f => (...args: any[]) =>
              f?.(item.schemaGroup, selectedItem.id, ...args),
            );
            const field = selectedItem?.fields.find(f2 => f2.id === f.id);
            const condf = f.only && selectedItem?.fields.find(f2 => f2.id === f.only?.field);
            const condsf = f.only && item.schemaFields.find(f2 => f2.id === f.only?.field);
            const condv =
              condf?.value ??
              condf?.mergedValue ??
              condsf?.defaultValue ??
              (condsf?.type ? zeroValues[condsf.type] : undefined);
            return {
              schemaField: f,
              field,
              events,
              hidden: f.only && (!condv || condv !== f.only.value),
            };
          })
        : [],
    [eventProps, item, selectedItem],
  );

  const handleItemMove = useCallback(
    (from: number, to: number) => {
      if (!item?.schemaGroup) return;
      const id = propertyListItems[from]?.id;
      if (!id) return;
      onItemMove?.(item.schemaGroup, id, from, to);
    },
    [item?.schemaGroup, onItemMove, propertyListItems],
  );
  const handleItemRemove = useCallback(
    (index: number) => {
      if (!item?.schemaGroup) return;
      const id = propertyListItems[index]?.id;
      if (!id) return;
      onItemRemove?.(item.schemaGroup, id, index);
    },
    [item?.schemaGroup, onItemRemove, propertyListItems],
  );
  const { onItemsUpdate: handleItemUpdate } = useBind({ onItemsUpdate }, item?.schemaGroup);

  const handleItemAdd = useCallback(() => {
    if (item) [onItemAdd?.(item.schemaGroup)];
  }, [onItemAdd, item]);

  const handleDelete = useCallback(() => {
    if (!onRemovePane || !item?.title) return;
    if (item?.title === intl.formatMessage({ defaultMessage: "Basic" })) {
      setModal(true);
    } else {
      onRemovePane();
    }
  }, [item, onRemovePane, intl]);

  return (
    <GroupWrapper
      className={className}
      name={group ? intl.formatMessage({ defaultMessage: "Template" }) : title || item?.title}>
      {isList && !!item && (
        <StyledPropertyList
          name={item.title || (item.id === "default" ? defaultItemName : "")}
          items={propertyListItems}
          layers={props.layers}
          layerMode={layerMode}
          selectedIndex={selected}
          onItemSelect={select}
          onItemAdd={handleItemAdd}
          onItemMove={handleItemMove}
          onItemRemove={handleItemRemove}
          onItemsUpdate={handleItemUpdate}
        />
      )}
      {!!item &&
        schemaFields?.map(f => {
          if (layerMode && f.schemaField.id === item.nameField) return null;

          return (
            <PropertyField
              key={f.schemaField.id}
              field={f.field}
              schema={f.schemaField}
              hidden={f.hidden}
              {...f.events}
              {...otherProps}
            />
          );
        })}
      {onRemovePane && (
        <StyledButton buttonType="primary" onClick={handleDelete}>
          <TrashIcon icon="bin" size={16} />
          {intl.formatMessage({ defaultMessage: "Delete" })}
        </StyledButton>
      )}
      <Modal
        button1={
          <Button
            large
            buttonType="danger"
            text={intl.formatMessage({ defaultMessage: "OK" })}
            onClick={onRemovePane}
          />
        }
        button2={
          <Button
            large
            buttonType="secondary"
            text={intl.formatMessage({ defaultMessage: "Cancel" })}
            onClick={() => setModal(false)}
          />
        }
        size="sm"
        isVisible={openModal}
        onClose={() => setModal(false)}>
        <StyledIcon icon="alert" size={24} />
        <ModalText>
          {intl.formatMessage({
            defaultMessage:
              "You are deleting the infobox and all its contents. Are you sure you want to do that?",
          })}
        </ModalText>
      </Modal>
    </GroupWrapper>
  );
};

const StyledPropertyList = styled(PropertyList)`
  margin-bottom: 20px;
`;

const StyledButton = styled(Button)`
  float: right;
`;

const TrashIcon = styled(Icon)`
  margin-right: ${metricsSizes["s"]}px;
`;

const StyledIcon = styled(Icon)`
  color: ${props => props.theme.main.alert};
`;

const ModalText = styled.p`
  margin-top: 12px;
`;

const valueToString = (v: ValueTypesType[ValueTypeType] | undefined): string | undefined => {
  if (typeof v === "string" || typeof v === "number") {
    return v.toString();
  }
  return undefined;
};

export default PropertyItem;
