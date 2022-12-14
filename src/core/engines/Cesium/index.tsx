import { ArcType, Color, ScreenSpaceEventType } from "cesium";
import React, { forwardRef } from "react";
import {
  Viewer,
  Fog,
  Sun,
  SkyAtmosphere,
  Scene,
  SkyBox,
  Camera,
  ScreenSpaceEventHandler,
  ScreenSpaceEvent,
  ScreenSpaceCameraController,
  Entity,
  PolylineGraphics,
} from "resium";

import type { Engine, EngineProps, EngineRef } from "..";

import Cluster from "./Cluster";
import Clock from "./core/Clock";
import Globe from "./core/Globe";
import ImageryLayers from "./core/Imagery";
import Indicator from "./core/Indicator";
import Event from "./Event";
import Feature, { context as featureContext } from "./Feature";
import useHooks from "./hooks";

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
    selectionReason,
    isLayerDraggable,
    isLayerDragging,
    shouldRender,
    meta,
    onLayerSelect,
    onCameraChange,
    onTick,
    onLayerDrag,
    onLayerDrop,
  },
  ref,
) => {
  const {
    backgroundColor,
    cesium,
    cameraViewBoundaries,
    cameraViewOuterBoundaries,
    cameraViewBoundariesMaterial,
    mouseEventHandles,
    cesiumIonAccessToken,
    handleMount,
    handleUnmount,
    handleUpdate,
    handleClick,
    handleCameraChange,
    handleCameraMoveEnd,
    context,
  } = useHooks({
    ref,
    property,
    camera,
    selectedLayerId,
    selectionReason,
    isLayerDraggable,
    meta,
    onLayerSelect,
    onCameraChange,
    onTick,
    onLayerDrag,
    onLayerDrop,
  });

  return (
    <featureContext.Provider value={context}>
      <Viewer
        ref={cesium}
        onUpdate={handleUpdate}
        className={className}
        animation
        timeline
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
        requestRenderMode={!property?.timeline?.animation && !isLayerDraggable && !shouldRender}
        maximumRenderTimeChange={
          !property?.timeline?.animation && !isLayerDraggable && !shouldRender
            ? Infinity
            : undefined
        }
        shadows={!!property?.atmosphere?.shadows}
        onClick={handleClick}
        onDoubleClick={mouseEventHandles.doubleclick}
        onMouseDown={mouseEventHandles.mousedown}
        onMouseUp={mouseEventHandles.mouseup}
        onRightClick={mouseEventHandles.rightclick}
        onRightDown={mouseEventHandles.rightdown}
        onRightUp={mouseEventHandles.rightup}
        onMiddleClick={mouseEventHandles.middleclick}
        onMiddleDown={mouseEventHandles.middledown}
        onMiddleUp={mouseEventHandles.middleup}
        onMouseMove={mouseEventHandles.mousemove}
        onMouseEnter={mouseEventHandles.mouseenter}
        onMouseLeave={mouseEventHandles.mouseleave}
        onWheel={mouseEventHandles.wheel}>
        <Event onMount={handleMount} onUnmount={handleUnmount} />
        <Clock property={property} onTick={onTick} />
        <ImageryLayers tiles={property?.tiles} cesiumIonAccessToken={cesiumIonAccessToken} />
        <Entity>
          <Indicator property={property} />
        </Entity>
        <ScreenSpaceEventHandler useDefault>
          {/* remove default click event */}
          <ScreenSpaceEvent type={ScreenSpaceEventType.LEFT_CLICK} />
          {/* remove default double click event */}
          <ScreenSpaceEvent type={ScreenSpaceEventType.LEFT_DOUBLE_CLICK} />
        </ScreenSpaceEventHandler>
        <ScreenSpaceCameraController
          maximumZoomDistance={
            property?.cameraLimiter?.cameraLimitterEnabled
              ? property.cameraLimiter?.cameraLimitterTargetArea?.height ?? Number.POSITIVE_INFINITY
              : Number.POSITIVE_INFINITY
          }
          enableCollisionDetection={!property?.default?.allowEnterGround}
        />
        <Camera
          onChange={handleCameraChange}
          percentageChanged={0.2}
          onMoveEnd={handleCameraMoveEnd}
        />
        {cameraViewBoundaries && property?.cameraLimiter?.cameraLimitterShowHelper && (
          <Entity>
            <PolylineGraphics
              positions={cameraViewBoundaries}
              width={1}
              material={Color.RED}
              arcType={ArcType.RHUMB}
            />
          </Entity>
        )}
        {cameraViewOuterBoundaries && property?.cameraLimiter?.cameraLimitterShowHelper && (
          <Entity>
            <PolylineGraphics
              positions={cameraViewOuterBoundaries}
              width={1}
              material={cameraViewBoundariesMaterial}
              arcType={ArcType.RHUMB}
            />
          </Entity>
        )}
        <Scene backgroundColor={backgroundColor} />
        <SkyBox show={property?.default?.skybox ?? true} />
        <Fog
          enabled={property?.atmosphere?.fog ?? true}
          density={property?.atmosphere?.fog_density}
        />
        <Sun show={property?.atmosphere?.enable_sun ?? true} />
        <SkyAtmosphere show={property?.atmosphere?.sky_atmosphere ?? true} />
        <Globe property={property} cesiumIonAccessToken={cesiumIonAccessToken} />
        {ready ? children : null}
      </Viewer>
    </featureContext.Provider>
  );
};

const creditContainer = document.createElement("div");

const Component = forwardRef(Cesium);

export default Component;

export const engine: Engine = {
  component: Component,
  featureComponent: Feature,
  clusterComponent: Cluster,
  // delegatedDataTypes: ["3dtiles", "czml"],
};
