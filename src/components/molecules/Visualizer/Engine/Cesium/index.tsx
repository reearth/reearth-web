import React, { forwardRef } from "react";
import { Viewer, Globe, Fog, Sun, SkyAtmosphere, ImageryLayer, Scene, SkyBox } from "resium";

import Loading from "@reearth/components/atoms/Loading";
import { Provider } from "../../engineApi";
import { EngineProps, Ref as EngineRef } from "..";
import useHooks from "./hooks";

const creditContainer = document.createElement("div");

export type SceneProperty = ScenePropertyType;
export type Props = EngineProps<SceneProperty>;

const Cesium: React.ForwardRefRenderFunction<EngineRef, EngineProps<SceneProperty>> = (
  {
    className,
    selectedLayerId: selectedEntityId,
    property,
    camera,
    small,
    ready,
    children,
    onLayerSelect,
    onCameraChange,
  },
  ref,
) => {
  const {
    api,
    loaded,
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    selectViewerEntity,
  } = useHooks({
    ready,
    selectedLayerId: selectedEntityId,
    property,
    camera,
    ref,
    onLayerSelect,
    onCameraChange,
  });

  return !loaded ? (
    <Loading />
  ) : (
    <Viewer
      ref={cesium}
      className={className}
      animation={false}
      timeline={false}
      fullscreenButton={false}
      homeButton={false}
      geocoder={false}
      infoBox={false}
      imageryProvider={false}
      baseLayerPicker={false}
      navigationHelpButton={false}
      projectionPicker={false}
      sceneModePicker={false}
      requestRenderMode
      maximumRenderTimeChange={Infinity}
      creditContainer={creditContainer}
      style={{
        width: small ? "300px" : "auto",
        height: small ? "300px" : "100%",
      }}
      onClick={selectViewerEntity}>
      <Provider value={api}>
        <Scene backgroundColor={backgroundColor} />
        <SkyBox show={property?.default?.skybox ?? true} />
        <Fog
          enabled={property?.atmosphere?.fog ?? true}
          density={property?.atmosphere?.fog_density}
        />
        <Sun show={property?.atmosphere?.enable_sun ?? true} />
        <SkyAtmosphere show={property?.atmosphere?.sky_atmosphere ?? true} />
        <Globe
          terrainProvider={terrainProvider}
          enableLighting={!!property?.atmosphere?.enable_lighting}
          showGroundAtmosphere={property?.atmosphere?.ground_atmosphere ?? true}
          atmosphereSaturationShift={property?.atmosphere?.surturation_shift}
          atmosphereHueShift={property?.atmosphere?.hue_shift}
          atmosphereBrightnessShift={property?.atmosphere?.brightness_shift}
        />
        {imageryLayers?.map(([id, im, min, max]) => (
          <ImageryLayer
            key={id}
            imageryProvider={im}
            minimumTerrainLevel={min}
            maximumTerrainLevel={max}
          />
        ))}
        {children}
      </Provider>
    </Viewer>
  );
};

export default forwardRef(Cesium);
