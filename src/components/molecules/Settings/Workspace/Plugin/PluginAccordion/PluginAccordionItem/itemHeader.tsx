import Box from "@reearth/components/atoms/Box";
import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import { fonts, styled } from "@reearth/theme";
import React, { useState } from "react";
import { useIntl } from "react-intl";

export type PluginItemProps = {
  className?: string;
  thumbnail?: string;
  title?: string;
  isInstalled?: boolean;
};

const PluginAccordionItemHeader: React.FC<PluginItemProps> = ({
  className,
  thumbnail,
  title,
  isInstalled,
}) => {
  const intl = useIntl();
  const [hovered, setHovered] = useState(false);
  const handleMouseEnter = () => {
    setHovered(true);
  };
  const handleMouseLeave = () => {
    setHovered(false);
  };
  console.log(thumbnail);
  return (
    <Wrapper align="center" justify="space-between" className={className}>
      <Flex align="center">
        <Box borderRadius={8} mh="m">
          <Thumbnail src={thumbnail} alt="plugin thumbnail" />
        </Box>
        <Text size="l" weight="bold">
          {title}
        </Text>
      </Flex>
      <StyledButton
        buttonType={isInstalled && hovered ? "danger" : "secondary"}
        type="button"
        large
        icon={isInstalled ? (hovered ? "bin" : "check") : "install"}
        text={
          isInstalled
            ? hovered
              ? intl.formatMessage({ defaultMessage: "Uninstall" })
              : intl.formatMessage({ defaultMessage: "Installed" })
            : intl.formatMessage({ defaultMessage: "Install" })
        }
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  width: 100%;
  padding: ${props => `${props.theme.metrics.xl}px 0`};
`;

const Thumbnail = styled.img`
  border-radius: 8px;
  width: 64px;
  height: 64px;
`;

const StyledButton = styled(Button)`
  font-weight: ${fonts.weight.bold};
  border-radius: ${props => props.theme.metrics.s}px;
  padding: ${({ theme }) => `${theme.metrics.s}px ${theme.metrics["2xl"]}`};
`;

export default PluginAccordionItemHeader;
