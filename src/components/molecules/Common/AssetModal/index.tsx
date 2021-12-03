import React, { useCallback, useState, useEffect } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Modal from "@reearth/components/atoms/Modal";
import TabularModal from "@reearth/components/atoms/TabularModal";
import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

export type Asset = {
  id: string;
  teamId: string;
  name: string;
  size: number;
  url: string;
  contentType: string;
};

export type Mode = "asset" | "url";

export type Props = {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  onSelect?: (asset?: { id?: string; url: string }) => void;
  fileType?: "image" | "video" | "file";
  selectedAsset?: {
    id?: string;
    url: string;
  };
  assetsContainer?: React.ReactNode;
};

type Tabs = "assets" | "url";

const AssetModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSelect,
  fileType,
  selectedAsset,
  assetsContainer,
}) => {
  const intl = useIntl();
  const labels: { [t in Tabs]: string } = {
    assets: intl.formatMessage({ defaultMessage: "Assets Library" }),
    url: intl.formatMessage({ defaultMessage: "Use URL" }),
  };

  const [selectedTab, selectTab] = useState<Tabs>("assets");
  const [textUrl, setTextUrl] = useState<string>();

  useEffect(() => {
    if (isOpen && selectedAsset && !selectedAsset.id) {
      setTextUrl(selectedAsset.url);
    } else {
      setTextUrl(undefined);
    }
  }, [selectedAsset, isOpen]);

  const handleSetUrl = useCallback(() => {
    onSelect?.((textUrl ? { url: textUrl } : selectedAsset) || undefined);
    onClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, selectedAsset, selectedTab, onSelect, fileType, textUrl]);

  const handleTextUrlChange = useCallback(text => {
    setTextUrl(text);
  }, []);

  const handleModalClose = useCallback(() => {
    setTextUrl(undefined);
    selectTab("assets");
    onClose?.();
  }, [onClose]);

  return fileType === "video" ? (
    <Modal
      size="sm"
      title={intl.formatMessage({ defaultMessage: "Add video URL" })}
      isVisible={isOpen}
      onClose={handleModalClose}
      button1={
        <Button
          large
          buttonType="primary"
          text={intl.formatMessage({ defaultMessage: "Save" })}
          onClick={handleSetUrl}
        />
      }
      button2={
        <Button
          large
          buttonType="secondary"
          text={intl.formatMessage({ defaultMessage: "Cancel" })}
          onClick={handleModalClose}
        />
      }>
      <Wrapper>
        <StyledTextField value={textUrl} onChange={handleTextUrlChange} />
      </Wrapper>
    </Modal>
  ) : (
    <TabularModal<Tabs>
      title={
        fileType === "image"
          ? intl.formatMessage({ defaultMessage: "Select Image" })
          : intl.formatMessage({ defaultMessage: "Select Resource" })
      }
      isVisible={isOpen}
      size="lg"
      onClose={handleModalClose}
      tabs={["assets", "url"]}
      tabLabels={labels}
      currentTab={selectedTab}
      setCurrentTab={selectTab}
      button1={
        <Button
          large
          text={intl.formatMessage({ defaultMessage: "Select" })}
          buttonType="primary"
          onClick={handleSetUrl}
        />
      }
      button2={
        <Button
          large
          text={intl.formatMessage({ defaultMessage: "Cancel" })}
          buttonType="secondary"
          onClick={handleModalClose}
        />
      }>
      {selectedTab === "assets" ? (
        assetsContainer
      ) : selectedTab === "url" ? (
        <TextContainer align="center">
          <Title size="s">
            {fileType === "image"
              ? intl.formatMessage({ defaultMessage: "Image URL" })
              : intl.formatMessage({ defaultMessage: "Resource URL" })}
          </Title>
          <StyledTextField value={textUrl} onChange={handleTextUrlChange} />
        </TextContainer>
      ) : null}
    </TabularModal>
  );
};

const TextContainer = styled(Flex)`
  align-items: center;
  width: 100%;
  margin: ${metricsSizes["xl"]}px;
`;

const Wrapper = styled.div`
  width: 100%;
`;

const Title = styled(Text)`
  margin: ${metricsSizes["m"]}px;
  flex: 1;
`;

const StyledTextField = styled(TextBox)`
  flex: 3;
`;

export default AssetModal;
