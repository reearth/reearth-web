import { Color, EntityCluster, HorizontalOrigin, VerticalOrigin } from "cesium";
import React, { useEffect, useMemo } from "react";
import { CustomDataSource } from "resium";

import { toCSSFont } from "@reearth/util/value";

import { ClusterProps } from "../ref";

const Cluster: React.FC<ClusterProps> = ({ property, children }) => {
  const {
    clusterPixelRange = 15,
    clusterMinSize = 3,
    clusterLabelTypography = {
      fontFamily: "sans-serif",
      fontSize: 30,
      fontWeight: 400,
      color: "#FFF",
      textAlign: "center",
      bold: false,
      italic: false,
      underline: false,
    },
    clusterImage,
    clusterImageWidth,
    clusterImageHeight,
  } = property?.default ?? {};

  const cluster = useMemo(() => {
    return new EntityCluster({
      enabled: true,
      pixelRange: clusterPixelRange,
      minimumClusterSize: clusterMinSize,
      clusterBillboards: true,
      clusterLabels: true,
      clusterPoints: true,
    });
  }, [clusterMinSize, clusterPixelRange]);

  useEffect(() => {
    return cluster?.clusterEvent.addEventListener((_clusteredEntities, clusterParam) => {
      clusterParam.label.font = toCSSFont(clusterLabelTypography, { fontSize: 30 });
      clusterParam.label.horizontalOrigin =
        clusterLabelTypography.textAlign === "right"
          ? HorizontalOrigin.LEFT
          : clusterLabelTypography.textAlign === "left"
          ? HorizontalOrigin.RIGHT
          : HorizontalOrigin.CENTER;
      clusterParam.label.verticalOrigin = VerticalOrigin.CENTER;
      clusterParam.label.fillColor = Color.fromCssColorString(
        clusterLabelTypography.color ?? "#FFF",
      );
      clusterParam.billboard.show = true;
      clusterParam.billboard.image = clusterImage;
      clusterParam.billboard.height = clusterImageWidth;
      clusterParam.billboard.width = clusterImageHeight;

      // force a re-cluster with the new styling https://sandcastle.cesium.com/index.html?src=Clustering.html
      cluster.pixelRange = 0;
      cluster.pixelRange = clusterPixelRange;
    });
  }, [
    clusterMinSize,
    clusterPixelRange,
    cluster,
    clusterLabelTypography,
    clusterImage,
    clusterImageHeight,
    clusterImageWidth,
  ]);

  return cluster ? (
    <CustomDataSource show clustering={cluster}>
      {children}
    </CustomDataSource>
  ) : null;
};

export default Cluster;
