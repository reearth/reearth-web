import React, { useCallback, useState } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import SelectField from "@reearth/components/atoms/SelectBox";
import Text from "@reearth/components/atoms/Text";

export type PrimitiveItem = { name: string; extensionId: string; icon: string; pluginId: string };

export type Props = {
  primitiveItems?: PrimitiveItem[];
  onCreateLayerGroup?: (pluginId: string, extensionId: string) => void;
};

const DatasetPropertyItem: React.FC<Props> = ({ primitiveItems, onCreateLayerGroup }) => {
  const intl = useIntl();
  const [selectedPrimitiveType, selectPrimitiveType] = useState("");

  const handlePrimitiveTypeChange = (type: string) => {
    if (primitiveItems?.map(p => p.extensionId).includes(type)) {
      selectPrimitiveType(type);
    }
  };

  const handleSubmit = useCallback(() => {
    const item = primitiveItems?.find(p => p.extensionId === selectedPrimitiveType);
    if (!item) return;
    onCreateLayerGroup?.(item?.pluginId, item?.extensionId);
  }, [onCreateLayerGroup, primitiveItems, selectedPrimitiveType]);

  const convertPrimitiveItemToDatasetPropertyItem = (
    items?: PrimitiveItem[],
  ): { key: string; label: string; icon: string }[] => {
    return items?.map(i => ({ key: i.extensionId, label: i.name, icon: i.icon })) || [];
  };
  return (
    <Flex direction="column">
      <Flex>
        <Text size="m">{intl.formatMessage({ defaultMessage: "Layer style" })}</Text>
        <SelectField
          items={convertPrimitiveItemToDatasetPropertyItem(primitiveItems)}
          onChange={handlePrimitiveTypeChange}
        />
      </Flex>
      <Button
        type="button"
        text={intl.formatMessage({ defaultMessage: "import" })}
        buttonType="primary"
        onClick={handleSubmit}
      />
    </Flex>
  );
};

export default DatasetPropertyItem;
