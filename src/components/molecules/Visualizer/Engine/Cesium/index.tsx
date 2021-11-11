import { Cartesian3, Color, ScreenSpaceEventType } from "cesium";
import React, { forwardRef } from "react";
import {
  Viewer,
  Clock,
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
  BoxGraphics,
  Entity,
} from "resium";

import type { EngineProps, Ref as EngineRef } from "..";

import Event from "./Event";
import useHooks from "./hooks";

export type { EngineProps as Props } from "..";

export type Box = {
  box_x: number;
  box_y: number;
  box_z: number;
  box_width: number;
  box_length: number;
  box_height: number;
};

const Cesium: React.ForwardRefRenderFunction<EngineRef, EngineProps> = (
  {
    className,
    style,
    property,
    camera,
    small,
    ready,
    children,
    selectedLayerId,
    onLayerSelect,
    onCameraChange,
    onLayerDrag,
    onLayerDrop,
    isLayerDraggable,
    isLayerDragging,
  },
  ref,
) => {
  const {
    terrainProvider,
    backgroundColor,
    imageryLayers,
    cesium,
    box,
    handleMount,
    handleUnmount,
    handleClick,
    handleCameraMoveEnd,
  } = useHooks({
    ref,
    property,
    camera,
    selectedLayerId,
    onLayerSelect,
    onCameraChange,
    onLayerDrag,
    onLayerDrop,
    isLayerDraggable,
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
        creditContainer={creditContainer}
        style={{
          width: small ? "300px" : "auto",
          height: small ? "300px" : "100%",
          display: ready ? undefined : "none",
          cursor: isLayerDragging ? "grab" : undefined,
          ...style,
        }}
        requestRenderMode={!property?.timeline?.animation && !isLayerDraggable}
        maximumRenderTimeChange={
          !property?.timeline?.animation && !isLayerDraggable ? Infinity : undefined
        }
        shadows={!!property?.atmosphere?.shadows}
        onClick={handleClick}>
        <Event onMount={handleMount} onUnmount={handleUnmount} />
        <Clock shouldAnimate={!!property?.timeline?.animation} />
        <ScreenSpaceEventHandler useDefault>
          {/* remove default double click event */}
          <ScreenSpaceEvent type={ScreenSpaceEventType.LEFT_DOUBLE_CLICK} />
        </ScreenSpaceEventHandler>
        <Camera onChange={handleCameraMoveEnd} percentageChanged={0} />
        <Scene backgroundColor={backgroundColor} />
        <SkyBox show={property?.default?.skybox ?? true} />
        <Fog
          enabled={property?.atmosphere?.fog ?? true}
          density={property?.atmosphere?.fog_density}
        />
        <Sun show={property?.atmosphere?.enable_sun ?? true} />
        <SkyAtmosphere show={property?.atmosphere?.sky_atmosphere ?? true} />
        {property?.cameraLimiter?.enable_outline && (
          <Entity position={Cartesian3.fromDegrees(box.box_x, box.box_y, box.box_z)}>
            <BoxGraphics
              dimensions={new Cartesian3(box.box_width, box.box_length, box.box_height)}
              outline={true}
              fill={false}
              outlineColor={Color.RED}></BoxGraphics>
          </Entity>
        )}
        <Globe
          terrainProvider={terrainProvider}
          depthTestAgainstTerrain={!!property?.default?.depthTestAgainstTerrain}
          enableLighting={!!property?.atmosphere?.enable_lighting}
          showGroundAtmosphere={property?.atmosphere?.ground_atmosphere ?? true}
          atmosphereSaturationShift={property?.atmosphere?.surturation_shift}
          atmosphereHueShift={property?.atmosphere?.hue_shift}
          atmosphereBrightnessShift={property?.atmosphere?.brightness_shift}
          terrainExaggeration={property?.default?.terrainExaggeration}
          terrainExaggerationRelativeHeight={property?.default?.terrainExaggerationRelativeHeight}
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
    </>
  );
};

const creditContainer = document.createElement("div");

export default forwardRef(Cesium);
