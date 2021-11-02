import React from "react";
import { useIntl } from "react-intl";

import Flex from "@reearth/components/atoms/Flex";
import TabCard from "@reearth/components/atoms/TabCard";
import Table from "@reearth/components/atoms/Table";
import Text from "@reearth/components/atoms/Text";
import { useTheme } from "@reearth/theme";

export type Props = {
  className?: string;
  datasets?: { [key: string]: string }[];
  datasetHeaders?: string[];
};

const DatasetInfoPane: React.FC<Props> = ({ datasetHeaders, datasets }) => {
  const intl = useIntl();
  const theme = useTheme();
  // const headers = ["title", "lat", "lng", "size", "color", "text"];
  // type Rows = typeof headers[number];
  // type Item = { [k in Rows]: string | number };
  // const data: Item[] = [
  //   {
  //     title: "Japan",
  //     lat: 35.03,
  //     lng: 135.71,
  //     size: 10,
  //     color: "#3d86fa",
  //     text: "short text",
  //   },
  //   {
  //     title: "America",
  //     lat: 50.1,
  //     lng: 170.71,
  //     size: 40,
  //     color: "#ffffff",
  //     text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  //   },
  // ];
  return (
    <Flex direction="column">
      <TabCard name={intl.formatMessage({ defaultMessage: "Data" })}>
        <Flex>
          <Text size="m">from pc</Text>
          <Table
            headers={datasetHeaders}
            items={datasets}
            bg={theme.properties.bg}
            borderColor={theme.properties.border}
          />
        </Flex>
      </TabCard>
      <TabCard name={intl.formatMessage({ defaultMessage: "Import to scene" })}></TabCard>
    </Flex>
  );
};

export default DatasetInfoPane;
