import React, { useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { styled } from "@reearth/theme";
import PasswordModal from "@reearth/components/molecules/Settings/Account/PasswordModal";
import Section from "@reearth/components/molecules/Settings/Section";
import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import Field from "@reearth/components/molecules/Settings/Field";
import Icon from "@reearth/components/atoms/Icon";

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

export default ProfileSection;
