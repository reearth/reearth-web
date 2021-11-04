import React from "react";
import { useIntl } from "react-intl";

import Flex from "@reearth/components/atoms/Flex";
import SelectField from "@reearth/components/atoms/SelectBox";
import Text from "@reearth/components/atoms/Text";

export type Props = {
  className?: string;
  primitiveTypes?: { key: string; label: string }[];
  onAddToScene?: (datasetSchemaId: string) => void;
};

const DatasetPropertyItem: React.FC<Props> = ({ className, primitiveTypes, onAddToScene }) => {
  const intl = useIntl();
  const sample = [
    { key: "marker", label: "marker" },
    { key: "sphere", label: "sphere" },
  ];
  const handlePrimitiveTypeChange = (t: string) => {
    console.log(t);
  };
  return (
    <Flex direction="column">
      <Flex>
        <Text size="m">{intl.formatMessage({ defaultMessage: "Layer style" })}</Text>
        <SelectField items={sample} onChange={handlePrimitiveTypeChange} />
      </Flex>
    </Flex>
  );
};

export default DatasetPropertyItem;
