import React from "react";
import { useIntl } from "react-intl";

import { styled, useTheme } from "@reearth/theme";
import Slide from "@reearth/components/atoms/Slide";
import Icon from "@reearth/components/atoms/Icon";
import Divider from "@reearth/components/atoms/Divider";
import List from "./List";
import Header from "./Header";
import useHooks from "./hooks";
import { DatasetSchema, Type } from "./types";
import Text from "@reearth/components/atoms/Text";
import Flex from "@reearth/components/atoms/Flex";
import { metricsSizes } from "@reearth/theme/metrics";

export { DatasetSchema, Dataset, DatasetField, Type } from "./types";

export type Props = {
  className?: string;
  linkedDataset?: {
    schema: string;
    dataset?: string;
    field: string;
    schemaName?: string;
    datasetName?: string;
    fieldName?: string;
  };
  isOverridden?: boolean;
  isLinkable?: boolean;
  fixedDatasetSchemaId?: string;
  fixedDatasetId?: string;
  linkableType?: Type;
  datasetSchemas?: DatasetSchema[];
  onDatasetPickerOpen?: () => void;
  onClear?: () => void;
  onUnlink?: () => void;
  onLink?: (datasetSchemaId: string, datasetId: string | undefined, fieldId: string) => void;
};

const PropertyLinkPanel: React.FC<Props> = ({
  className,
  linkedDataset,
  isLinkable,
  isOverridden,
  fixedDatasetSchemaId,
  fixedDatasetId,
  linkableType,
  datasetSchemas,
  onLink,
  onUnlink,
  onDatasetPickerOpen,
  onClear,
}) => {
  const intl = useIntl();
  const {
    selected,
    pos,
    startDatasetSelection,
    finishDatasetSelection,
    proceed,
    back,
    visibleDatasetSchemas,
    selectedSchema,
    selectedDatasetPath,
    clear,
    // unlink,
  } = useHooks({
    onDatasetPickerOpen,
    linkedDataset,
    onLink,
    onUnlink,
    onClear,
    linkableType,
    datasetSchemas,
    fixedDatasetSchemaId,
    fixedDatasetId,
    isLinkable,
  });
  const theme = useTheme();

  return (
    <Wrapper className={className}>
      <Slide pos={pos}>
        <FirstSlidePage>
          {!isOverridden && isLinkable ? (
            <>
              <Link align="center" justify="space-between" onClick={startDatasetSelection}>
                <Text size="xs" color={theme.colors.primary.main}>
                  {intl.formatMessage({ defaultMessage: "Link to dataset" })}
                </Text>
                <Icon icon="arrowRight" size={16} color={theme.colors.primary.main} />
              </Link>
              <Divider margin="0" />
            </>
          ) : linkedDataset ? (
            <Text
              size="xs"
              color={theme.colors.text.strong}
              otherProperties={{ padding: `${metricsSizes["s"]}px 0 0 ${metricsSizes["s"]}px` }}>
              {intl.formatMessage({ defaultMessage: "From" })}
            </Text>
          ) : (
            <Text
              size="xs"
              color={theme.colors.text.weak}
              otherProperties={{ padding: `${metricsSizes["s"]}px` }}>
              {intl.formatMessage({ defaultMessage: "No linked data" })}
            </Text>
          )}
          {/* {linkedDataset && (
            <Link onClick={unlink}>
              <Text size="xs" customColor>
                {intl.formatMessage({ defaultMessage: "Unlink the dataset" })}
              </Text>
              <Icon icon="cancel" size={16} />
            </Link>
          )} */}
          <LinkedData>
            {selectedDatasetPath?.length ? (
              <LinkedDataDetailContent>
                {isOverridden && (
                  <Text size="xs" color={theme.colors.functional.attention}>
                    {intl.formatMessage({ defaultMessage: "Overridden" })}
                  </Text>
                )}
                {selectedDatasetPath && (
                  <Text
                    size="xs"
                    color={theme.colors.primary.main}
                    otherProperties={{
                      textDecoration: "underline",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                    {selectedDatasetPath.join("/")}
                  </Text>
                )}
                <Text size="xs" color={theme.colors.primary.main}>
                  {selectedDatasetPath[selectedDatasetPath.length - 1]}
                </Text>
              </LinkedDataDetailContent>
            ) : (
              ""
            )}
          </LinkedData>
          <Divider margin="0" />
          <Link align="center" justify="space-between" onClick={clear}>
            <Text size="xs" color={theme.colors.danger.main}>
              {isOverridden
                ? intl.formatMessage({ defaultMessage: "Reset this field" })
                : intl.formatMessage({ defaultMessage: "Clear this field" })}
            </Text>
            <Icon icon="fieldClear" size={16} color={theme.colors.danger.main} />
          </Link>
        </FirstSlidePage>
        {!fixedDatasetSchemaId && (
          <SlidePage>
            <Header title="" onBack={back} />
            <List
              items={visibleDatasetSchemas}
              showArrows
              onSelect={id => proceed({ schema: id })}
              selectedItem={selected.schema}
            />
          </SlidePage>
        )}
        {linkedDataset && (
          <SlidePage>
            <Header title="" onBack={back} />
            <List
              items={selectedSchema?.datasets}
              showArrows
              onSelect={id => proceed({ dataset: id })}
              selectedItem={selected.dataset}
            />
          </SlidePage>
        )}
        <SlidePage>
          <Header title="" onBack={back} />
          <List
            items={selectedSchema?.fields}
            selectableType={linkableType}
            onSelect={id => finishDatasetSelection(id)}
            selectedItem={selected.field}
          />
        </SlidePage>
      </Slide>
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  background-color: ${({ theme }) => theme.colors.bg["3"]};
  border-radius: 5px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
  width: 200px;
  height: 200px;
  z-index: ${props => props.theme.zIndexes.propertyFieldPopup};
`;

const SlidePage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
`;

const FirstSlidePage = styled(SlidePage)`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

const LinkedData = styled.div`
  padding: 7px 10px;
  flex: auto;
`;

const LinkedDataDetailContent = styled.div`
  width: 135px;

  * {
    margin: 4px 0;
  }
`;

const Link = styled(Flex)`
  cursor: pointer;
  user-select: none;
  padding: ${metricsSizes["s"]}px;
`;

export default PropertyLinkPanel;
