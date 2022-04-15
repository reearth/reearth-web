import React, { useCallback } from "react";
import { useIntl } from "react-intl";
import { useMedia } from "react-use";

import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import Avatar from "@reearth/components/molecules/Settings/Avatar";
import { metricsSizes, styled, useTheme } from "@reearth/theme";

import EditableItem from "../../Project/EditableItem";

export type Role = "READER" | "WRITER" | "OWNER";

export type Props = {
  name?: string;
  email?: string;
  role: Role;
  owner?: boolean;
  isMyself?: boolean;
  personal?: boolean;
  onChangeRole: (role: Role) => void;
  onRemove: () => void;
};

const MemberListItem: React.FC<Props> = ({ name, email, role, owner, onChangeRole, onRemove }) => {
  const intl = useIntl();
  const theme = useTheme();
  const isSmallWindow = useMedia("(max-width: 1024px)");
  const saveEdit = useCallback(
    (role?: string) => {
      if (!role) return;
      onChangeRole(role as Role);
    },
    [onChangeRole],
  );

  const roles = [
    { key: "READER", label: intl.formatMessage({ defaultMessage: "Reader" }) },
    { key: "WRITER", label: intl.formatMessage({ defaultMessage: "Writer" }) },
    { key: "OWNER", label: intl.formatMessage({ defaultMessage: "Owner" }) },
  ];

  return (
    <Wrapper align="flex-start" justify="space-between">
      <StyledAvatar size={32} color={theme.main.avatarbg} radius={50}>
        <Text size={isSmallWindow ? "m" : "l"} color={theme.text.pale}>
          {name?.charAt(0).toUpperCase()}
        </Text>
      </StyledAvatar>
      <Flex flex={1}>
        <StyledEditableItem
          title={name}
          subTitle={email}
          dropdown
          dropdownItems={roles}
          currentItem={role}
          body={roles.find(r => r.key === role)?.label}
          onSubmit={saveEdit}
          disabled={!(owner === true && role !== "OWNER")}
        />
      </Flex>
      {owner === true && role !== "OWNER" && <StyledIcon icon="bin" size={20} onClick={onRemove} />}
    </Wrapper>
  );
};

const Wrapper = styled(Flex)`
  width: 100%;
  height: 100px;
  color: ${({ theme }) => theme.properties.contentsText};
`;

const StyledEditableItem = styled(EditableItem)`
  width: 100%;
`;

const StyledAvatar = styled(Avatar)`
  margin: 0 ${metricsSizes["l"]}px;
`;

const StyledIcon = styled(Icon)`
  padding: 0;
  margin: 0 ${metricsSizes["l"]}px;
  cursor: pointer;
`;

export default MemberListItem;
