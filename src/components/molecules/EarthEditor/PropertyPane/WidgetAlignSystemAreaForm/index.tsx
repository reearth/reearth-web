import React from "react";

import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import ToggleButton from "@reearth/components/atoms/ToggleButton";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import ColorField from "../PropertyField/ColorField";
import NumberField from "../PropertyField/NumberField";

export type Props = {
  onChange?: () => Promise<void> | void;
};

const WidgetAlignSystemAreaForm: React.FC<Props> = () => {
  const t = useT();
  return (
    <>
      <FormItemWrapper>
        <PaddingTitleWrapper>
          <Text size="xs" otherProperties={{ userSelect: "none" }}>
            {t("Padding")}
          </Text>
        </PaddingTitleWrapper>
        <PaddingPropertyFieldsWrapper>
          <PaddingPropertyFieldsRow style={{ justifyContent: "center" }}>
            <PaddingFieldWrapper>
              <NumberField suffix="px" min={0} />
            </PaddingFieldWrapper>
          </PaddingPropertyFieldsRow>

          <PaddingPropertyFieldsRow style={{ justifyContent: "space-between" }}>
            <PaddingFieldWrapper>
              <NumberField suffix="px" min={0} />
            </PaddingFieldWrapper>
            <PaddingFieldWrapper>
              <NumberField suffix="px" min={0} />
            </PaddingFieldWrapper>
          </PaddingPropertyFieldsRow>
          <PaddingPropertyFieldsRow style={{ justifyContent: "center" }}>
            <PaddingFieldWrapper>
              <NumberField suffix="px" min={0} />
            </PaddingFieldWrapper>
          </PaddingPropertyFieldsRow>
        </PaddingPropertyFieldsWrapper>
      </FormItemWrapper>
      <FormItemWrapper />
      <FormItemWrapper>
        <StyledPropertyTitleWrapper>
          <Text size="xs" otherProperties={{ userSelect: "none" }}>
            {t("Gap Spacing")}
          </Text>
        </StyledPropertyTitleWrapper>
        <StyledPropertyFieldWrapper>
          <NumberField suffix="px" min={0} />
        </StyledPropertyFieldWrapper>
      </FormItemWrapper>
      <FormItemWrapper>
        <StyledPropertyTitleWrapper>
          <Text size="xs" otherProperties={{ userSelect: "none" }}>
            {t("Align Center")}
          </Text>
        </StyledPropertyTitleWrapper>
        <StyledPropertyFieldWrapper>
          <ToggleButton />
        </StyledPropertyFieldWrapper>
      </FormItemWrapper>
      <FormItemWrapper>
        <StyledPropertyTitleWrapper>
          <Text size="xs" otherProperties={{ userSelect: "none" }}>
            {t("Bg Color")}
          </Text>
        </StyledPropertyTitleWrapper>
        <StyledPropertyFieldWrapper>
          <ColorField value="red" onChange={() => 0} />
        </StyledPropertyFieldWrapper>
      </FormItemWrapper>
    </>
  );
};

const FormItemWrapper = styled(Flex)`
  flex-wrap: wrap;
  margin-bottom: ${metricsSizes.l}px;
  align-items: center;
`;

const StyledPropertyTitleWrapper = styled.div`
  flex: 1;
  font-size: 12px;
  margin-right: ${metricsSizes.s}px;
`;

const StyledPropertyFieldWrapper = styled.div`
  flex: 2;
  width: 100%;
  min-width: 0;
`;

const PaddingTitleWrapper = styled.div`
  flex: 1;
  width: 100%;
  font-size: 12px;
  margin-bottom: 8px;
`;

const PaddingPropertyFieldsWrapper = styled.div`
  border: 1px dashed #4a4a4a;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const PaddingPropertyFieldsRow = styled.div`
  flex: 0 0 100%;
  display: flex;
`;

const PaddingFieldWrapper = styled.div`
  width: 52px;
`;

export default WidgetAlignSystemAreaForm;
