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
  ScreenSpaceEventHandler,
  ScreenSpaceEvent,
} from "resium";
import { ScreenSpaceEventType } from "cesium";

import Loading from "@reearth/components/atoms/Loading";
import { EngineProps, Ref as EngineRef } from "..";
import useHooks, { SceneProperty as ScenePropertyType } from "./hooks";
import CameraFlyTo from "./CameraFlyTo";

export type SceneProperty = ScenePropertyType;
export type Props = EngineProps<SceneProperty>;

const Cesium: React.ForwardRefRenderFunction<EngineRef, EngineProps<SceneProperty>> = (
  {
    className,
    style,
    property,
    camera,
    small,
    ready,
    children,
    selectedPrimitiveId,
    onPrimitiveSelect,
    onCameraChange,
  },
  ref,
) => {
  const {
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    selectViewerEntity,
    onCameraMoveEnd,
  } = useHooks({
    ref,
    property,
    camera,
    selectedPrimitiveId,
    onPrimitiveSelect,
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
          ...style,
        }}
        onClick={selectViewerEntity}>
        <ScreenSpaceEventHandler useDefault>
          {/* remove default click event */}
          <ScreenSpaceEvent type={ScreenSpaceEventType.LEFT_CLICK} />
          {/* remove default double click event */}
          <ScreenSpaceEvent type={ScreenSpaceEventType.LEFT_DOUBLE_CLICK} />
        </ScreenSpaceEventHandler>
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
        {ready ? children : null}
      </Viewer>
      {!ready && <Loading />}
    </>
  );
};

const creditContainer = document.createElement("div");

export default forwardRef(Cesium);
