import React from "react";
import { useIntl } from "react-intl";

import Flex from "@reearth/components/atoms/Flex";
import TabCard from "@reearth/components/atoms/TabCard";
import Table from "@reearth/components/atoms/Table";
import Text from "@reearth/components/atoms/Text";
import { useTheme } from "@reearth/theme";

import DatasetPropertyItem from "./DatasetProperty/PropertyItem";

export type Props = {
  className?: string;
  datasets?: { [key: string]: string }[];
  datasetHeaders?: string[];
  primitiveTypes?: string[];
};

const DatasetInfoPane: React.FC<Props> = ({ datasetHeaders, datasets }) => {
  const intl = useIntl();
  const theme = useTheme();
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
        <DatasetPropertyItem />
      </TabCard>
    </Flex>
  );
};

export default DatasetInfoPane;
