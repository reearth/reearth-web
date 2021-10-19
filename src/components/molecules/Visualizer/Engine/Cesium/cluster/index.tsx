import { EntityCluster } from "cesium";
import React from "react";
import { CustomDataSource } from "resium";

import { ClusterItem, ClusterLayer } from "../..";
import { LayerStore } from "../../..";
import P from "../../../Primitive";

export type Props = {
  pluginProperty?: { [key: string]: any };
  cluster: ClusterItem;
  isEditable?: boolean;
  isBuilt?: boolean;
  pluginBaseUrl?: string;
  layers?: LayerStore;
  clusterLayers?: ClusterLayer[];
  selectedLayerId?: string;
  overriddenProperties?: { [id in string]: any };
  isLayerHidden?: (id: string) => boolean;
};

const Cluster: React.FC<Props> = ({
  pluginProperty,
  cluster,
  isEditable,
  isBuilt,
  pluginBaseUrl,
  layers,
  clusterLayers,
  selectedLayerId,
  overriddenProperties,
  isLayerHidden,
}) => {
  const clusteringObj = new EntityCluster({
    enabled: true,
    pixelRange: 15,
    minimumClusterSize: 2,
    clusterBillboards: true,
    clusterLabels: true,
    clusterPoints: true,
  });
  // useEffect(() => {
  //   clusterObj.clusterEvent.addEventListener(function (clusteredEntities, cluster) {
  //     console.log("hello");
  //     cluster.billboard.id = cluster.label.id;
  //     cluster.billboard.image = pin50;
  //     // "http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png";
  //   });
  // }, [clusterObj]);

  // .clusterEvent.addEventListener(function (clusteredEntities, cluster) {
  //   console.log(cluster);
  //   cluster.billboard.id = cluster.label.id;
  //   cluster.billboard.image =
  //     "http://maps.gstatic.com/mapfiles/place_api/icons/generic_business-71.png";
  // })

  return (
    <>
      <CustomDataSource
        name={cluster.cluster_name}
        show
        onChange={source => console.log(source)}
        clustering={clusteringObj}>
        <div style={{ backgroundColor: "red" }}>
          {layers?.flattenLayersRaw
            ?.filter(layer =>
              clusterLayers?.some(clusterLayer => clusterLayer.cluster_layer === layer.id),
            )
            .map(layer =>
              !layer.isVisible || !!layer.children ? null : (
                <P
                  key={layer.id}
                  layer={layer}
                  pluginProperty={
                    layer.pluginId && layer.extensionId
                      ? pluginProperty?.[`${layer.pluginId}/${layer.extensionId}`]
                      : undefined
                  }
                  isHidden={isLayerHidden?.(layer.id)}
                  isEditable={isEditable}
                  isBuilt={isBuilt}
                  isSelected={!!selectedLayerId && selectedLayerId === layer.id}
                  pluginBaseUrl={pluginBaseUrl}
                  overriddenProperties={overriddenProperties}
                />
              ),
            )}
        </div>
      </CustomDataSource>
    </>
  );
};

export default Cluster;
