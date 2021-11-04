import React from "react";
import { useIntl } from "react-intl";

import Flex from "@reearth/components/atoms/Flex";
import SelectField from "@reearth/components/atoms/SelectBox";
import Text from "@reearth/components/atoms/Text";

export type Props = {
  className?: string;
  primitiveItems?: { key: string; label: string; icon: string }[];
  onAddToScene?: (datasetSchemaId: string) => void;
};

const DatasetPropertyItem: React.FC<Props> = ({ className, primitiveItems, onAddToScene }) => {
  const intl = useIntl();
  const handlePrimitiveTypeChange = (t: string) => {
    console.log(t);
  };
  return (
    <Flex direction="column">
      <Flex>
        <Text size="m">{intl.formatMessage({ defaultMessage: "Layer style" })}</Text>
        <SelectField items={primitiveItems} onChange={handlePrimitiveTypeChange} />
      </Flex>
    </Flex>
  );
};

export default DatasetPropertyItem;
