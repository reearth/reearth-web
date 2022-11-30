import Button from "@reearth/components/atoms/Button";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

export type Props = {
  policy: {
    id: string;
    name: string;
  };
  modalOpen?: boolean;
  onModalOpen?: () => void;
  onModalClose?: () => void;
};

const PolicyModal: React.FC<Props> = ({ policy, modalOpen, onModalOpen, onModalClose }) => {
  const t = useT();
  return (
    <>
      <PolicyText size="m" weight="bold" onClick={onModalOpen}>
        {policy.name}
      </PolicyText>
      <Modal
        title={t("Check your plan")}
        size="sm"
        isVisible={modalOpen}
        button1={
          <Button large onClick={onModalClose}>
            {t("OK")}
          </Button>
        }
        onClose={onModalClose}>
        <Text size="m">
          {t(`Your workspace is currently a ${policy.name} workspace. If you would like to know the
         details of your plan, or change your plan, please click `)}
          <PolicyLink href="https://reearth.io/service/cloud" target="_blank">
            {t("here")}
          </PolicyLink>
          .
        </Text>
      </Modal>
    </>
  );
};

export default PolicyModal;

const PolicyText = styled(Text)`
  background: #2b2a2f;
  padding: 4px 20px;
  border-radius: 12px;
  user-select: none;
  transition: background 0.2s;
  cursor: pointer;

  :hover {
    background: #3f3d45;
  }
`;

const PolicyLink = styled.a`
  text-decoration: none;
  color: ${({ theme }) => theme.main.accent};

  :hover {
    color: ${({ theme }) => theme.main.select};
  }
`;
