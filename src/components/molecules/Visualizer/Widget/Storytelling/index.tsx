import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Math as CesiumMath } from "cesium";
import { useClickAway, useMedia } from "react-use";

import { useTheme, styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";
import { Camera as CameraValue } from "@reearth/util/value";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import Icon from "@reearth/components/atoms/Icon";

import { Props as WidgetProps } from "../../Widget";
import { useVisualizerContext } from "../../context";

export type Props = WidgetProps<Property>;

export type Story = {
  title: string;
  layer?: string;
  layerDuration?: number;
  layerRange?: number;
  layerCamera?: CameraValue;
};

export type Property = {
  default?: {
    duration?: number;
    range?: number;
    camera?: CameraValue;
    autoStart?: boolean;
  };
  stories?: Story[];
};

const defaultRange = 50000;
const defaultDuration = 3;
const defaultOffset = {
  heading: CesiumMath.toRadians(0),
  pitch: CesiumMath.toRadians(-30),
  range: defaultRange,
};

const Storytelling = ({ widget }: Props): JSX.Element | null => {
  const ctx = useVisualizerContext();
  const theme = useTheme();

  const storiesData = (widget?.property as Property | undefined)?.stories;
  const { camera, duration = defaultDuration, autoStart, range } = widget?.property?.default ?? {};

  const [menuOpen, setMenu] = useState(false);
  const wrapperRef = useRef(null);
  useClickAway(wrapperRef, () => {
    setMenu(false);
  });

  const isExtraSmallWindow = useMedia("(max-width: 420px)");

  const { flyTo, lookAt } = ctx?.engine ?? {};
  const selectPrimitive = ctx?.pluginAPI?.reearth.primitives.select;
  const primitives = ctx?.primitives;

  const stories = useMemo<Story[]>(() => {
    if (!storiesData || !primitives) return [];
    return storiesData
      .map(story => {
        const primitive = primitives.find(l => l.id === story.layer);
        return primitive
          ? {
              ...story,
              title: story.title || primitive.title,
            }
          : undefined;
      })
      .filter((s): s is Story => !!s);
  }, [primitives, storiesData]);

  const [layerIndex, setLayerIndex] = useState<number>();
  const currentLayerId = typeof layerIndex === "number" ? stories?.[layerIndex]?.layer : undefined;
  const selectedLayer = useMemo(
    () => (currentLayerId ? primitives?.find(p => p.id === currentLayerId) : undefined),
    [primitives, currentLayerId],
  );

  const selectLayer = useCallback(
    (index: number) => {
      const story = stories?.[index];
      if (!story) return;

      const id = story?.layer;
      setMenu(false);
      setLayerIndex(index);
      selectPrimitive?.(id);

      const layer = id ? primitives?.find(p => p.id === id) : undefined;

      // Photooverlays have own camera flight and that is the priority here.
      if (
        layer?.pluginId === "reearth" &&
        layer.extensionId === "photooverlay" &&
        !!layer.property?.default?.camera
      ) {
        return;
      }

      if (story.layerCamera) {
        flyTo?.(story.layerCamera, {
          duration: story.layerDuration ?? duration,
        });
        return;
      }

      const position = {
        lat: layer?.property?.default?.location?.lat as number | undefined,
        lng: layer?.property?.default?.location?.lng as number | undefined,
        height: layer?.property?.default?.height as number | undefined,
      };

      if (typeof position.lat === "number" && typeof position.lng === "number") {
        lookAt?.(
          {
            lat: position.lat,
            lng: position.lng,
            height: position.height ?? 0,
            ...(camera
              ? {
                  heading: camera.heading,
                  pitch: camera.pitch,
                  range: story.layerRange ?? range ?? defaultRange,
                }
              : defaultOffset),
          },
          {
            duration: story.layerDuration ?? duration,
          },
        );
      }
    },
    [camera, duration, flyTo, lookAt, primitives, range, selectPrimitive, stories],
  );

  const handleNext = useCallback(() => {
    selectLayer(typeof layerIndex === "undefined" ? 0 : layerIndex + 1);
  }, [selectLayer, layerIndex]);

  const handlePrev = useCallback(() => {
    selectLayer(typeof layerIndex === "undefined" ? 0 : layerIndex - 1);
  }, [selectLayer, layerIndex]);

  useEffect(() => {
    const id = selectedLayer?.id;
    const index = id ? stories?.findIndex(l => l.layer === id) : undefined;
    setLayerIndex(index);
  }, [selectedLayer, stories]);

  useEffect(() => {
    if (!selectedLayer) setMenu(false);
  }, [selectedLayer]);

  const layerCount = stories?.length ?? 0;
  useEffect(() => {
    if (!autoStart || layerCount === 0) return;
    selectLayer(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]); // ignore everything else autoStart

  const layerPageCount = stories?.length;

  return typeof layerPageCount === "number" && layerPageCount > 0 ? (
    <div>
      <Menu ref={wrapperRef} menuOpen={menuOpen}>
        {stories?.map((story, i) => (
          <MenuItem
            key={story.layer}
            selected={selectedLayer?.id === story.layer}
            align="center"
            onClick={selectLayer.bind(undefined, i)}>
            <StyledIcon
              icon="marker"
              size={16}
              color={selectedLayer?.id === story.layer ? theme.main.strongText : theme.main.text}
            />
            <Text
              size="m"
              color={selectedLayer?.id === story.layer ? theme.main.strongText : theme.main.text}
              otherProperties={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}>
              {story.title}
            </Text>
          </MenuItem>
        ))}
      </Menu>
      <Widget>
        <ArrowButton disabled={layerIndex === 0} onClick={handlePrev}>
          <Icon icon="arrowLeft" size={24} />
        </ArrowButton>
        <Current align="center" justify="space-between">
          <MenuIcon
            icon="storytellingMenu"
            onClick={() => setMenu(!menuOpen)}
            menuOpen={menuOpen}
          />
          <Title size="m" weight="bold">
            {selectedLayer?.title}
          </Title>
          <Text
            size={isExtraSmallWindow ? "xs" : "m"}
            weight="bold"
            otherProperties={{ userSelect: "none" }}>
            {typeof layerIndex === "undefined" ? "-" : layerIndex + 1} / {layerPageCount}
          </Text>
        </Current>
        <ArrowButton disabled={layerIndex === layerPageCount - 1} onClick={handleNext}>
          <Icon icon="arrowRight" size={24} />
        </ArrowButton>
      </Widget>
    </div>
  ) : null;
};

const Widget = styled.div`
  background-color: ${props => props.theme.main.paleBg};
  color: ${props => props.theme.main.text};
  display: flex;
  align-items: stretch;
  border-radius: ${metricsSizes["s"]}px;
  overflow: hidden;
  height: 80px;
  width: 500px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  pointer-event: auto;

  // @media (max-width: 1366px) {
  //   left: 30px;
  //   bottom: 30px;
  // }

  @media (max-width: 560px) {
    display: flex;
    width: 90vw;
    margin: 0 auto;
    height: 56px;
  }
`;

const ArrowButton = styled.button`
  background-color: ${props => props.theme.main.paleBg};
  display: flex;
  flex-flow: column;
  justify-content: center;
  text-align: center;
  border: none;
  padding: ${metricsSizes["s"]}px;
  cursor: pointer;
  color: inherit;

  &:disabled {
    color: #888;
    cursor: auto;
  }

  @media (max-width: 420px) {
    padding: ${metricsSizes["2xs"]}px;
  }
`;

const Current = styled(Flex)`
  width: 100%;
  padding: ${metricsSizes["2xl"]}px;

  @media (max-width: 420px) {
    padding: ${metricsSizes["s"]}px;
  }
`;

const Title = styled(Text)`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  box-sizing: border-box;
  margin: 0 auto;
  max-width: 250px;
  text-align: center;

  @media (max-width: 420px) {
    max-width: 190px;
  }
`;

const StyledIcon = styled(Icon)`
  color: ${props => props.theme.main.text};
  margin-right: ${metricsSizes["l"]}px;
`;

const MenuIcon = styled(Icon)<{ menuOpen?: boolean }>`
  background: ${props => (props.menuOpen ? props.theme.main.bg : props.theme.main.paleBg)};
  border-radius: 25px;
  padding: ${metricsSizes["xs"]}px;
  margin-right: ${metricsSizes["xs"]}px;
  cursor: pointer;
  user-select: none;
`;

const Menu = styled.div<{ menuOpen?: boolean }>`
  background-color: ${props => props.theme.main.paleBg};
  z-index: ${props => props.theme.zIndexes.dropDown};
  position: absolute;
  width: 324px;
  max-height: 500px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: ${metricsSizes["s"]}px;
  display: ${({ menuOpen }) => (!menuOpen ? "none" : "")};
  padding: ${metricsSizes["m"]}px ${metricsSizes["s"]}px;
  transform: translate(0, -105%);

  @media (max-width: 1366px) {
    // left: 30px;
    // bottom: 118px;
  }

  @media (max-width: 560px) {
    // right: 16px;
    // left: 16px;
    // bottom: 80px;
    border: 1px solid ${props => props.theme.main.text};
  }

  @media (max-width: 420px) {
    width: auto;
  }
`;

const MenuItem = styled(Flex)<{ selected?: boolean }>`
  border-radius: ${metricsSizes["m"]}px;
  padding: ${metricsSizes["m"]}px ${metricsSizes["s"]}px;
  background: ${({ theme, selected }) => (selected ? theme.main.highlighted : "inherit")};
  cursor: pointer;
  user-select: none;

  &:hover {
    background: ${props => !props.selected && props.theme.main.bg};
  }
`;

export default Storytelling;
