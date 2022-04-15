import React, { useState, useCallback, PropsWithChildren } from "react";
import { useMedia } from "react-use";

import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import defaultProjectImage from "@reearth/components/molecules/Dashboard/defaultProjectImage.jpg";
import Field from "@reearth/components/molecules/Settings/Field";
import SelectField from "@reearth/components/molecules/Settings/SelectField";
import { styled, useTheme } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

import Avatar from "../../Avatar";

export type Props<T extends string = string> = {
  className?: string;
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
  body?: T;
  dropdown?: boolean;
  isImage?: boolean;
  dropdownItems?:
    | {
        key: T;
        label: string;
        icon?: string | undefined;
      }[]
    | undefined;
  currentItem?: T;
  imageSrc?: string;
  icon?: string;
  isAvatar?: boolean;
  avatar?: string;
  iHeight?: string;
  multilineTextBox?: boolean;
  disabled?: boolean;
  onSubmit?: (body: T | undefined) => void;
  onEditStart?: () => void;
  onEditCancel?: () => void;
};

export default function EditableItem<T extends string = string>({
  className,
  title,
  subTitle,
  body,
  dropdown,
  isImage,
  dropdownItems,
  currentItem,
  multilineTextBox,
  imageSrc,
  icon,
  iHeight,
  disabled,
  isAvatar,
  avatar,
  onSubmit,
  onEditStart,
  onEditCancel,
}: PropsWithChildren<Props<T>>): JSX.Element | null {
  const [isEditting, setIsEditting] = useState(false);
  const [inputState, setInputState] = useState(currentItem || body);
  const theme = useTheme();
  const isSmallWindow = useMedia("(max-width: 1024px)");
  const startEdit = useCallback(() => {
    if (onEditStart) {
      onEditStart();
    } else {
      setIsEditting(true);
    }
  }, [setIsEditting, onEditStart]);

  const cancelEdit = useCallback(() => {
    if (onEditCancel) {
      onEditCancel();
    } else {
      setIsEditting(false);
    }
  }, [setIsEditting, onEditCancel]);

  const saveEdit = useCallback(() => {
    inputState && onSubmit?.(inputState);
    setIsEditting(false);
  }, [inputState, onSubmit, setIsEditting]);

  return isEditting && !disabled ? (
    dropdown ? (
      <Field
        className={className}
        header={title}
        subHeader={subTitle}
        action={
          <ButtonWrapper>
            <StyledIcon icon="cancel" size={20} onClick={cancelEdit} />
            <StyledIcon icon="check" size={20} onClick={saveEdit} />
          </ButtonWrapper>
        }>
        <SelectFieldWrapper>
          <SelectField value={inputState} items={dropdownItems} onChange={setInputState} />
        </SelectFieldWrapper>
      </Field>
    ) : (
      <Field
        className={className}
        header={title}
        subHeader={subTitle}
        action={
          <ButtonWrapper>
            <StyledIcon icon="cancel" size={20} onClick={cancelEdit} />
            <StyledIcon icon="check" size={20} onClick={saveEdit} />
          </ButtonWrapper>
        }>
        <TextBox
          onChange={setInputState}
          floatedTextColor="white"
          borderColor="#3f3d45"
          value={body}
          multiline={multilineTextBox}
        />
      </Field>
    )
  ) : (
    <Field
      className={className}
      header={title}
      subHeader={subTitle}
      body={body}
      action={
        !disabled && (
          <ButtonWrapper>
            {imageSrc && <StyledIcon icon="bin" size={20} onClick={() => onSubmit?.(undefined)} />}
            <StyledIcon icon="edit" size={20} onClick={startEdit} />
          </ButtonWrapper>
        )
      }>
      {imageSrc || isImage ? (
        <div>
          <Image src={imageSrc || defaultProjectImage} height={iHeight} />
        </div>
      ) : isAvatar ? (
        <StyledAvatar size={16} color={theme.main.bg} radius={50}>
          <Text size={isSmallWindow ? "m" : "l"} color={theme.text.pale}>
            {avatar?.charAt(0).toUpperCase()}
          </Text>
        </StyledAvatar>
      ) : (
        icon && (
          <div>
            <Icon icon={icon} size={iHeight} />
          </div>
        )
      )}
    </Field>
  );
}

const StyledIcon = styled(Icon)`
  padding: 0;
  margin-left: ${metricsSizes["l"]}px;
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.main.strongText};
  }
`;

const SelectFieldWrapper = styled.div`
  width: 200px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Image = styled.img`
  max-height: 800px;
  max-width: 480px;
  width: 75%;
`;
const StyledAvatar = styled(Avatar)`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0px;
  width: 64px;
  height: 64px;
  left: 150px;
  top: 0px;
  bottom: 2px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
`;
