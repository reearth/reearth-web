import React, { forwardRef } from "react";
import {
  Viewer,
  Globe,
  Fog,
  Sun,
  SkyAtmosphere,
  ImageryLayer,
  Scene,
  SkyBox,
  Camera,
} from "resium";

import Loading from "@reearth/components/atoms/Loading";
import { Provider } from "../../engineApi";
import { EngineProps, Ref as EngineRef } from "..";
import useHooks, { SceneProperty as ScenePropertyType } from "./hooks";
import CameraFlyTo from "./CameraFlyTo";

const creditContainer = document.createElement("div");

export type SceneProperty = ScenePropertyType;
export type Props = EngineProps<SceneProperty>;

const Cesium: React.ForwardRefRenderFunction<EngineRef, EngineProps<SceneProperty>> = (
  {
    className,
    selectedPrimitiveId: selectedEntityId,
    property,
    camera,
    small,
    ready,
    children,
    onPrimitiveSelect: onLayerSelect,
    onCameraChange,
  },
  ref,
) => {
  const {
    engineApi,
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    selectViewerEntity,
    onCameraMoveEnd,
  } = useHooks({
    selectedLayerId: selectedEntityId,
    property,
    ref,
    onLayerSelect,
    onCameraChange,
  });

  return (
    <>
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
          display: ready ? undefined : "none",
        }}
        onClick={selectViewerEntity}>
        <Provider value={engineApi}>
          <Camera onMoveEnd={onCameraMoveEnd} />
          <CameraFlyTo camera={camera} duration={0} />
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
      {!ready && <Loading />}
    </>
  );
};

export default forwardRef(Cesium);
