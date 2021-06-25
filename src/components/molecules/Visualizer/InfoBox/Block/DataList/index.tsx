import React, { Fragment } from "react";

import { styled, fonts } from "@reearth/theme";
import { Typography, typographyStyles } from "@reearth/util/value";
import Icon from "@reearth/components/atoms/Icon";

import { Title } from "../common";
import { Props as BlockProps } from "..";

export type Props = BlockProps<Property>;

export type Item = {
  id: string;
  item_title?: string;
  item_datatype?: "string" | "number";
  item_datastr?: string;
  item_datanum?: number;
};

export type Property = {
  default?: {
    title?: string;
    typography?: Typography;
  };
  items?: Item[];
};

const DataList: React.FC<Props> = ({
  block,
  infoboxProperty,
  isHovered,
  isSelected,
  isEditable,
  onClick,
}) => {
  const items = block?.property?.items;
  const { title, typography } = block?.property?.default ?? {};
  const isTemplate = !title && !items;

  return (
    <Wrapper
      onClick={onClick}
      typography={typography}
      isSelected={isSelected}
      isHovered={isHovered}
      isTemplate={isTemplate}
      isEditable={isEditable}>
      {isTemplate && isEditable ? (
        <Template>
          <StyledIcon icon="dl" isHovered={isHovered} isSelected={isSelected} size={24} />
        </Template>
      ) : (
        <>
          {title && <Title infoboxProperty={infoboxProperty}>{title}</Title>}
          <Dl>
            {items?.map(i => (
              <Fragment key={i.id}>
                <Dt>{i.item_title}</Dt>
                <Dd>{i.item_datatype === "number" ? i.item_datanum : i.item_datastr}</Dd>
              </Fragment>
            ))}
          </Dl>
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  typography?: Typography;
  isSelected?: boolean;
  isHovered?: boolean;
  isTemplate: boolean;
  isEditable?: boolean;
}>`
  margin: 0 8px;
  font-size: ${fonts.sizes.s}px;
  color: ${({ theme }) => theme.infoBox.mainText};
  ${({ typography }) => typographyStyles(typography)}
  border: 1px solid
    ${({ isSelected, isHovered, isTemplate, isEditable, theme }) =>
    (!isTemplate && !isHovered && !isSelected) || !isEditable
      ? "transparent"
      : isHovered
      ? theme.infoBox.border
      : isSelected
      ? theme.infoBox.accent2
      : theme.infoBox.weakText};
  border-radius: 6px;
  min-height: 70px;
`;

const Dl = styled.dl`
  display: flex;
  flex-wrap: wrap;
  min-height: 15px;
`;

const Dt = styled.dt`
  width: 30%;
  padding: 10px;
  padding-left: 0;
  box-sizing: border-box;
  font-weight: bold;
`;

const Dd = styled.dd`
  width: 70%;
  margin: 0;
  padding: 10px;
  padding-right: 0;
  box-sizing: border-box;
`;

const Template = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 185px;
  margin: 0 auto;
  user-select: none;
`;

const StyledIcon = styled(Icon)<{ isSelected?: boolean; isHovered?: boolean }>`
  color: ${props =>
    props.isHovered
      ? props.theme.infoBox.border
      : props.isSelected
      ? props.theme.infoBox.accent2
      : props.theme.infoBox.weakText};
`;

export default DataList;
