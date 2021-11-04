import React from "react";
import { useIntl } from "react-intl";

import Flex from "@reearth/components/atoms/Flex";
import TabCard from "@reearth/components/atoms/TabCard";
import Table from "@reearth/components/atoms/Table";
import Text from "@reearth/components/atoms/Text";
import { useTheme } from "@reearth/theme";

import DatasetPropertyItem from "./DatasetProperty/PropertyItem";

export type PrimitiveItem = { name: string; extensionId: string; icon: string };

export type Props = {
  className?: string;
  datasets?: { [key: string]: string }[];
  datasetHeaders?: string[];
  primitiveItems?: PrimitiveItem[];
};

const DatasetInfoPane: React.FC<Props> = ({ datasetHeaders, datasets, primitiveItems }) => {
  const intl = useIntl();
  const theme = useTheme();
  const convertPrimitiveItemToDatasetPropertyItem = (
    items?: PrimitiveItem[],
  ): { key: string; label: string; icon: string }[] => {
    return items?.map(i => ({ key: i.extensionId, label: i.name, icon: i.icon })) || [];
  };
  return (
    <Flex direction="column">
      <TabCard name={intl.formatMessage({ defaultMessage: "Data" })}>
        <Flex direction="column">
          <Text size="m">from pc</Text>
          <Table
            headers={datasetHeaders}
            items={datasets}
            bg={theme.properties.bg}
            borderColor={theme.properties.border}
          />
        </Flex>
      </TabCard>
      <TabCard name={intl.formatMessage({ defaultMessage: "Import to scene" })}>
        <DatasetPropertyItem
          primitiveItems={convertPrimitiveItemToDatasetPropertyItem(primitiveItems)}
        />
      </TabCard>
    </Flex>
  );
};

export default DatasetInfoPane;
