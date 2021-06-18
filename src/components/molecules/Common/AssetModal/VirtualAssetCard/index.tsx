import React, { useCallback, useState, useEffect } from "react";
import { styled } from "@reearth/theme";

type CardSize = "small" | "medium" | "large" | "list";

export type Props = {
  assetsLength?: number;
  containerWidth?: number;
  cardSize?: CardSize;
};

const VirtualAssetCard: React.FC<Props> = ({ assetsLength, containerWidth, cardSize }) => {
  const [virtualWidth, setVirtualWidth] = useState(0);
  const mediumSizeSpace = 216;
  const smallSizeSpace = 128;

  const handleVirtualWidth = useCallback(() => {
    if (containerWidth) {
      if (assetsLength) {
        const cardWidth = cardSize === "medium" ? mediumSizeSpace : smallSizeSpace;
        const numInrow = Math.floor(containerWidth / cardWidth);
        const lastRowNum = assetsLength % numInrow;
        const gapWidth = (containerWidth - cardWidth * numInrow) / (numInrow - 1);
        const virtualBoxNumber = numInrow - lastRowNum;
        const virtualBoxWidth = virtualBoxNumber * cardWidth + gapWidth * (virtualBoxNumber - 1);
        if (lastRowNum === 0) {
          setVirtualWidth(0);
        } else {
          setVirtualWidth(virtualBoxWidth);
        }
      }
    }
  }, [assetsLength, cardSize, containerWidth]);

  useEffect(() => {
    handleVirtualWidth();
  }, [containerWidth, handleVirtualWidth]);

  return <Wrapper width={virtualWidth} cardSize={cardSize} />;
};

const Wrapper = styled.div<{ width?: number; cardSize?: CardSize }>`
  width: ${p => p.width}px;
  ${({ width }) => (width === 0 ? "display: none;" : null)};
  box-sizing: border-box;
`;

export default VirtualAssetCard;
