import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import theme, { styled } from "@reearth/theme";
import PasswordModal from "@reearth/components/molecules/Settings/Account/PasswordModal";
import Section from "@reearth/components/molecules/Settings/Section";
import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import Field from "@reearth/components/molecules/Settings/Field";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import Flex from "@reearth/components/atoms/Flex";

export type Props = {
  email?: string;
  appTheme?: string;
  lang?: string;
  hasPassword: boolean;
  updatePassword?: (password: string, passwordConfirmation: string) => void;
  updateLanguage?: (lang: string) => void;
  updateTheme?: (theme: string) => void;
};

const items = [
  { key: "ja", label: "日本語" },
  { key: "en", label: "English" },
];

type Theme = "DARK" | "LIGHT";

const ProfileSection: React.FC<Props> = ({
  email,
  appTheme,
  hasPassword,
  updatePassword,
  updateLanguage,
  updateTheme,
}) => {
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState<string>();
  const [currentThemeValue, setCurrentThemeValue] = useState<string>();
  const [currentThemeLabel, setCurrentThemeLabel] = useState<string>();
  const themeItems: { key: Theme; label: string; icon: string }[] = useMemo(
    () => [
      { key: "DARK", label: intl.formatMessage({ defaultMessage: "Dark theme" }), icon: "moon" },
      { key: "LIGHT", label: intl.formatMessage({ defaultMessage: "Light theme" }), icon: "sun" },
    ],
    [intl],
  );

  useEffect(() => {
    const lang = items.find(item => item.key === intl.locale);
    setCurrentLang(lang?.label);
  }, [intl.locale]);

  useEffect(() => {
    const appThemeValue = appTheme ?? "DARK";
    setCurrentThemeValue(appThemeValue);
    const label = themeItems.find(themeItem => themeItem.key === appThemeValue)?.label;
    setCurrentThemeLabel(label);
  }, [appTheme, themeItems]);

  return (
    <Wrapper>
      <Section title={intl.formatMessage({ defaultMessage: "Account" })}>
        <Field header={intl.formatMessage({ defaultMessage: "Email address" })} body={email} />
        <Field
          header={intl.formatMessage({ defaultMessage: "Password" })}
          body={"**********"}
          action={<StyledIcon icon="edit" size={20} onClick={() => setIsOpen(!isOpen)} />}
        />
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Service language" })}
          dropdown
          dropdownItems={items}
          currentItem={intl.locale}
          body={currentLang}
          onSubmit={updateLanguage}
        />
        <EditableItem
          title={intl.formatMessage({ defaultMessage: "Color theme" })}
          dropdown
          dropdownItems={themeItems}
          currentItem={currentThemeValue}
          body={currentThemeLabel}
          onSubmit={updateTheme}
        />
        <Notice>
          <Icon icon="alert" size={16} color={theme.colors.dark.functional.attention} />
          <Message>
            <StyledText size="xs">
              {intl.formatMessage({
                defaultMessage:
                  "Light theme is still in beta. Some UI may still not be supported (ie. public projects will not use light theme).",
              })}
            </StyledText>
          </Message>
        </Notice>
      </Section>
      <PasswordModal
        hasPassword={hasPassword}
        updatePassword={updatePassword}
        isVisible={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background-color: ${({ theme }) => theme.main.paleBg};
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.main.strongText};
  }
`;

const Notice = styled(Flex)`
  margin-left: 184px;
`;

const Message = styled.div`
  max-width: 500px;
`;

const StyledText = styled(Text)`
  margin-left: 12px;
  font-style: italic;
`;

export default ProfileSection;
