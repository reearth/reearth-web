import React, { useCallback } from "react";
import { useIntl } from "react-intl";

import Avatar from "@reearth/components/atoms/Avatar";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import { metricsSizes, styled, useTheme } from "@reearth/theme";

import EditableItem from "../../Project/EditableItem";

export type Role = "READER" | "WRITER" | "OWNER";

type user = {
  id?: string;
  name?: string;
  email?: string;
};
export type Props = {
  user: user;
  role: Role;
  owner?: boolean;
  isMyself?: boolean;
  personal?: boolean;
  onChangeRole: (role: Role) => void;
  onRemove: () => void;
};

const MemberListItem: React.FC<Props> = ({ user, role, owner, onChangeRole, onRemove }) => {
  const intl = useIntl();
  const theme = useTheme();
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
      <Avatar size={32} color={theme.main.avatarBg} userName={user.name} />

      <StyledEditableItem
        title={user.name}
        subtitle={user.email}
        dropdown
        dropdownItems={roles}
        currentItem={role}
        body={roles.find(r => r.key === role)?.label}
        onSubmit={saveEdit}
        disabled={!(owner === true && role !== "OWNER")}
      />
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

const StyledIcon = styled(Icon)`
  padding: 0;
  margin: 0 ${metricsSizes["l"]}px;
  cursor: pointer;
`;

export default MemberListItem;
