import { defined, Color, PinBuilder, EntityCluster } from "cesium";
import React, { useEffect, useMemo, useRef } from "react";
import { CustomDataSource } from "resium";

import { LayerStore } from "../../..";
import P from "../../../Primitive";

export type Props = {
    pluginProperty?: { [key: string]: any };
    cluster: any;
    isEditable?: boolean;
    isBuilt?: boolean;
    pluginBaseUrl?: string;
    layers?: LayerStore;
    clusterLayers?: any[];
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
    const clusteringObj = useMemo(
        () =>
            new EntityCluster({
                enabled: true,
                pixelRange: 15,
                minimumClusterSize: 2,
                clusterBillboards: true,
                clusterLabels: true,
                clusterPoints: true,
            }),
        [],
    );
    const clusterRef = useRef(cluster);
    let removeListener: any;
    const removeListenerRef = useRef(removeListener);
    useEffect(() => {
        clusterRef.current = cluster;
        if (defined(removeListenerRef.current)) {
            removeListenerRef.current();
            removeListenerRef.current = undefined;
        }
        removeListenerRef.current = clusteringObj.clusterEvent.addEventListener(
            (clusteredEntities, clusterParam) => {
                if (clusterRef.current.cluster_shapeType === "label") {
                    clusterParam.billboard.show = false;
                    clusterParam.label.show = true;

                    clusterParam.label.font = clusterRef.current.cluster_sizeType
                        ? clusterRef.current.cluster_sizeType + "px sans-serif"
                        : "80px sans-serif";
                    clusterParam.label.fillColor = Color.fromCssColorString(
                        clusterRef.current.cluster_textColor ? clusterRef.current.cluster_textColor : "#ffffff",
                    );
                    if (clusterRef.current.cluster_backgroundColor) {
                        clusterParam.label.showBackground = true;
                        clusterParam.label.backgroundColor = Color.fromCssColorString(
                            clusterRef.current.cluster_backgroundColor
                                ? clusterRef.current.cluster_backgroundColor
                                : "#ffffff",
                        );
                    } else {
                        clusterParam.label.showBackground = false;
                    }
                    if (clusterRef.current.cluster_image) {
                        clusterParam.billboard.show = true;
                        clusterParam.label.show = false;
                        clusterParam.billboard.image = clusterRef.current.cluster_image;
                    }
                } else {
                    clusterParam.billboard.show = true;
                    clusterParam.label.show = false;
                    clusterParam.billboard.id = clusterParam.label.id;

                    if (clusterRef.current.cluster_image) {
                        clusterParam.billboard.image = new PinBuilder().fromUrl(
                            clusterRef.current.cluster_image,
                            Color.fromCssColorString(
                                clusterRef.current.cluster_backgroundColor
                                    ? clusterRef.current.cluster_backgroundColor.toString()
                                    : "#000000",
                            ),
                            clusterRef.current.cluster_sizeType ? clusterRef.current.cluster_sizeType : 48,
                        );
                    } else {
                        clusterParam.billboard.image = new PinBuilder()
                            .fromText(
                                clusterParam.label.text,
                                Color.fromCssColorString(
                                    clusterRef.current.cluster_backgroundColor
                                        ? clusterRef.current.cluster_backgroundColor.toString()
                                        : "#000000",
                                ),
                                clusterRef.current.cluster_sizeType ? clusterRef.current.cluster_sizeType : 48,
                            )
                            .toDataURL();
                    }
                }
            },
        );
        clusteringObj.pixelRange = 0;
        clusteringObj.pixelRange = clusterRef.current.cluster_pixelRange
            ? clusterRef.current.cluster_pixelRange
            : 15;
        clusteringObj.minimumClusterSize = clusterRef.current.cluster_minSize
            ? clusterRef.current.cluster_minSize
            : 3;
    }, [cluster, clusteringObj, clusteringObj.clusterEvent]);

    return (
        <>
            <CustomDataSource
                name={cluster.cluster_name}
                show
                onClick={source => console.log(source)}
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
