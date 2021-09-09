import Flex from "@reearth/components/atoms/Flex";
import TabCard from "@reearth/components/atoms/TabCard";
import Text from "@reearth/components/atoms/Text";
import React from "react";
import { useIntl } from "react-intl";

export type Props = {
  className?: string;
};

const DatasetInfoPane: React.FC<Props> = () => {
  const intl = useIntl();
  return (
    <Flex direction="column">
      <TabCard name={intl.formatMessage({ defaultMessage: "Data" })}>
        <Flex>
          <Text size="m">from pc</Text>
        </Flex>
      </TabCard>
      <TabCard name={intl.formatMessage({ defaultMessage: "Import to scene" })}></TabCard>
    </Flex>
  );
};

export default DatasetInfoPane;
