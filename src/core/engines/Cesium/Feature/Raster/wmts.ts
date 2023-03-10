import {
  GeographicTilingScheme,
  WebMapTileServiceImageryProvider,
  WebMercatorTilingScheme,
} from "cesium";
import { XMLParser, X2jOptionsOptional } from "fast-xml-parser";

import { f, isDefined } from "@reearth/core/mantle/data/utils";

export const getWMTSImageryProvider = async (url?: string, layerCode?: string, credit?: string) => {
  if (!isDefined(url) || !isDefined(layerCode)) return;
  const capabilitiesUrl = getCapabilitiesUrl(url);
  if (!isDefined(capabilitiesUrl)) return;
  const capabilities = await getCapablitiesFromUrl(capabilitiesUrl);
  console.log("capablities: ", capabilities);
  console.log("layerCode: ", layerCode);
  const layer = findLayerFromCapablities(capabilities, layerCode);
  console.log("layerFromCode: ", layer);
  const layerIdentifier = layer?.Identifier;
  if (!isDefined(layer) || !isDefined(layerIdentifier)) {
    return;
  }

  let format = "image/png";
  const formats = layer.Format;
  if (formats && formats?.indexOf("image/png") === -1 && formats?.indexOf("image/jpeg") !== -1) {
    format = "image/jpeg";
  }

  // if layer has defined ResourceURL we should use it because some layers support only Restful encoding. See #2927
  const resourceUrl: ResourceUrl | ResourceUrl[] | undefined = layer.ResourceURL;
  const tempUrl = new URL(url);
  tempUrl.search = "";
  let baseUrl: string = tempUrl.toString();

  if (resourceUrl) {
    if (Array.isArray(resourceUrl)) {
      for (let i = 0; i < resourceUrl.length; i++) {
        const url: ResourceUrl = resourceUrl[i];
        if (url.format.indexOf(format) !== -1 || url.format.indexOf("png") !== -1) {
          baseUrl = url.template;
        }
      }
    } else {
      if (format === resourceUrl.format || resourceUrl.format.indexOf("png") !== -1) {
        baseUrl = resourceUrl.template;
      }
    }
  }

  const style = getStyle(layer);
  console.log("obtained style: ", style);
  console.log("capabilities.tileMatrixSets: ", capabilities.tileMatrixSets);

  const tileMatrixSet = getTileMatrixSet(layer, capabilities.tileMatrixSets);
  console.log("tileMatrixSet: ", tileMatrixSet);
  if (!isDefined(tileMatrixSet)) {
    return;
  }
  console.log("format: ", format);

  const imageryProvider = new WebMapTileServiceImageryProvider({
    url: baseUrl,
    layer: layerIdentifier,
    style: "default",
    tileMatrixSetID: tileMatrixSet.id,
    tileMatrixLabels: tileMatrixSet.labels,
    minimumLevel: tileMatrixSet.minLevel,
    maximumLevel: tileMatrixSet.maxLevel,
    tileWidth: tileMatrixSet.tileWidth,
    tileHeight: tileMatrixSet.tileHeight,
    tilingScheme: new GeographicTilingScheme(),
    format,
    credit,
  });
  return imageryProvider;
};

const getCapabilitiesUrl = (uri: string): string | undefined => {
  if (uri) {
    const url = new URL(uri);
    url.searchParams.set("service", "WMTS");
    url.searchParams.set("version", "1.0.0");
    url.searchParams.set("request", "GetCapabilities");
    return url.toString();
  } else {
    return undefined;
  }
};

const getCapablitiesFromUrl = async (url: string): Promise<WmtsCapabilities> => {
  const xmlDataStr = await (await f(url)).text();
  const cleanXml = xmlDataStr.replace(/(ows|psf):/g, "");
  console.log("cleanXMl: ", cleanXml);
  const options: X2jOptionsOptional = {
    ignoreAttributes: false,
    attributeNamePrefix: "",
  };
  const parser = new XMLParser(options);
  const capabilities = parser.parse(cleanXml) as Capabilities;
  console.log("capabilites: ", capabilities);
  const capabilitiesJson = capabilities.Capabilities;

  const layers: WmtsLayer[] = [];
  const tileMatrixSets: TileMatrixSet[] = [];

  console.log("capabilitesJson: ", capabilitiesJson);

  const layerElements = capabilitiesJson.Contents?.Layer as Array<WmtsLayer> | WmtsLayer;
  if (layerElements && Array.isArray(layerElements)) {
    layers.push(...layerElements);
  } else if (layerElements) {
    layers.push(layerElements as WmtsLayer);
  }

  const tileMatrixSetsElements = capabilitiesJson.Contents?.TileMatrixSet as
    | Array<TileMatrixSet>
    | TileMatrixSet;
  if (tileMatrixSetsElements && Array.isArray(tileMatrixSetsElements)) {
    tileMatrixSets.push(...tileMatrixSetsElements);
  } else if (tileMatrixSetsElements) {
    tileMatrixSets.push(tileMatrixSetsElements as TileMatrixSet);
  }

  return {
    layers,
    tileMatrixSets,
  };
};

const findLayerFromCapablities = (
  capabilities: WmtsCapabilities,
  name: string,
): WmtsLayer | undefined => {
  // Look for an exact match on the name.
  if (capabilities.layers === undefined) {
    return undefined;
  }
  console.log("capabilities.layers: ", capabilities.layers);
  let match = capabilities.layers.find(layer => layer.Identifier === name || layer.Title === name);
  console.log("match: ", match);
  if (!match) {
    const colonIndex = name.indexOf(":");
    if (colonIndex >= 0) {
      // This looks like a namespaced name. Such names will (usually?) show up in GetCapabilities
      // as just their name without the namespace qualifier.
      const nameWithoutNamespace = name.substring(colonIndex + 1);
      match = capabilities.layers.find(
        layer => layer.Identifier === nameWithoutNamespace || layer.Title === nameWithoutNamespace,
      );
    }
  }

  return match;
};

const getTileMatrixSet = (
  layer: WmtsLayer | undefined,
  matrixSets: TileMatrixSet[],
):
  | {
      id: string;
      labels: string[];
      maxLevel: number;
      minLevel: number;
      tileWidth: number;
      tileHeight: number;
    }
  | undefined => {
  const usableTileMatrixSets = getUsableTileMatrixSets(matrixSets);

  let tileMatrixSetLinks: TileMatrixSetLink[] = [];
  if (layer?.TileMatrixSetLink) {
    if (Array.isArray(layer?.TileMatrixSetLink)) {
      tileMatrixSetLinks = [...layer.TileMatrixSetLink];
    } else {
      tileMatrixSetLinks = [layer.TileMatrixSetLink];
    }
  }

  let tileMatrixSetId = "urn:ogc:def:wkss:OGC:1.0:GoogleMapsCompatible";
  let maxLevel = 0;
  let minLevel = 0;
  let tileWidth = 256;
  let tileHeight = 256;
  let tileMatrixSetLabels: string[] = [];
  console.log("tileMatrixSetLinks: ", tileMatrixSetLinks);
  console.log("usableTileMatrixSets: ", usableTileMatrixSets);
  for (let i = 0; i < tileMatrixSetLinks.length; i++) {
    const tileMatrixSet = tileMatrixSetLinks[i].TileMatrixSet;
    if (usableTileMatrixSets?.[tileMatrixSet]) {
      tileMatrixSetId = tileMatrixSet;
      tileMatrixSetLabels = usableTileMatrixSets[tileMatrixSet].identifiers;
      tileWidth = Number(usableTileMatrixSets[tileMatrixSet].tileWidth);
      tileHeight = Number(usableTileMatrixSets[tileMatrixSet].tileHeight);
      break;
    }
  }

  if (Array.isArray(tileMatrixSetLabels)) {
    const levels = tileMatrixSetLabels.map(label => {
      const lastIndex = label.lastIndexOf(":");
      return Math.abs(Number(label.substring(lastIndex + 1)));
    });
    maxLevel = levels.reduce((currentMaximum, level) => {
      return level > currentMaximum ? level : currentMaximum;
    }, 0);
    minLevel = levels.reduce((currentMaximum, level) => {
      return level < currentMaximum ? level : currentMaximum;
    }, 0);
  }

  return {
    id: tileMatrixSetId,
    labels: tileMatrixSetLabels,
    maxLevel: maxLevel,
    minLevel: minLevel,
    tileWidth: tileWidth,
    tileHeight: tileHeight,
  };
};

const getUsableTileMatrixSets = (matrixSets: TileMatrixSet[]) => {
  const usableTileMatrixSets: { [key: string]: UsableTileMatrixSets } = {
    "urn:ogc:def:wkss:OGC:1.0:GoogleMapsCompatible": {
      identifiers: ["0"],
      tileWidth: 256,
      tileHeight: 256,
    },
  };

  const standardTilingScheme = new WebMercatorTilingScheme();

  if (matrixSets === undefined) {
    return;
  }
  console.log("matrixSet: ", matrixSets);
  for (let i = 0; i < matrixSets.length; i++) {
    const matrixSet = matrixSets[i];
    if (
      !matrixSet.SupportedCRS ||
      (/EPSG.*900913/.test(matrixSet.SupportedCRS) && !/EPSG.*3857/.test(matrixSet.SupportedCRS))
    ) {
      continue;
    }
    console.log("made it here!!");
    // Usable tile matrix sets must have a single 256x256 tile at the root.
    const matrices = matrixSet.TileMatrix;
    if (!isDefined(matrices) || matrices.length < 1) {
      continue;
    }

    const levelZeroMatrix = matrices[0];

    console.log("levelZeroMatrix: ", levelZeroMatrix);

    if (!isDefined(levelZeroMatrix.TopLeftCorner)) {
      continue;
    }

    const levelZeroTopLeftCorner = levelZeroMatrix.TopLeftCorner.split(" ");
    const startX = parseFloat(levelZeroTopLeftCorner[0]);
    const startY = parseFloat(levelZeroTopLeftCorner[1]);
    const rectangleInMeters = standardTilingScheme.rectangleToNativeRectangle(
      standardTilingScheme.rectangle,
    );
    console.log("rectangleInMeters: ", rectangleInMeters);
    if (
      Math.abs(startX - rectangleInMeters.west) > 1 ||
      Math.abs(startY - rectangleInMeters.north) > 1
    ) {
      continue;
    }
    console.log("made it here too!!!");

    if (isDefined(matrixSet.TileMatrix) && matrixSet.TileMatrix.length > 0) {
      const ids = matrixSet.TileMatrix.map(function (item: { Identifier: any }) {
        return item.Identifier;
      });
      const firstTile = matrixSet.TileMatrix[0];
      usableTileMatrixSets[matrixSet.Identifier] = {
        identifiers: ids,
        tileWidth: firstTile.TileWidth,
        tileHeight: firstTile.TileHeight,
      };
    }
  }

  return usableTileMatrixSets;
};

const getStyle = (capabilitiesLayer: WmtsLayer): string | undefined => {
  const availStyles = getAvailStyles(capabilitiesLayer);
  console.log("availStyle: ", availStyles);
  const layerAvailableStyles = availStyles.find(
    candidate => candidate.layerName === capabilitiesLayer?.Identifier,
  )?.styles;

  return (
    layerAvailableStyles?.find((style: WmtsAvailStyle) => style.isDefault)?.identifier ??
    layerAvailableStyles?.[0]?.identifier
  );
};

const getAvailStyles = (capabilitiesLayer: WmtsLayer): WmtsAvailLayerStyle[] => {
  const result: any = [];
  const layer = capabilitiesLayer;
  if (!layer) {
    return result;
  }
  const styles: ReadonlyArray<CapabilitiesStyle> = layer?.Style
    ? Array.isArray(layer.Style)
      ? layer.Style
      : [layer.Style]
    : [];
  result.push({
    layerName: layer?.Identifier,
    styles: styles.map((style: CapabilitiesStyle) => {
      return {
        identifier: style.Identifier,
        isDefault: style.isDefault,
        abstract: style.Abstract,
      };
    }),
  });

  return result;
};

type WmtsAvailLayerStyle = {
  layerName?: string;
  styles?: WmtsAvailStyle[];
};

type WmtsAvailStyle = {
  identifier?: string;
  title?: string;
  abstract?: string;
  isDefault: boolean;
};

type WmtsLayer = {
  // according to start WMTS only have title
  readonly Title: string;
  readonly Abstract?: string;
  readonly Identifier?: string;
  readonly WGS84BoundingBox?: BoundingBox;
  readonly Style?: CapabilitiesStyle | CapabilitiesStyle[];
  readonly Format?: string | ReadonlyArray<string>;
  readonly infoFormat?: string | ReadonlyArray<string>;
  readonly TileMatrixSetLink?: TileMatrixSetLink | TileMatrixSetLink[];
  readonly ResourceURL?: ResourceUrl | ResourceUrl[];
};

type WmtsCapabilitiesLegend = CapabilitiesLegend & {
  readonly OnlineResource?: undefined;
  readonly "xlink:href"?: string;
};

type CapabilitiesLegend = {
  readonly OnlineResource?: OnlineResource;
  readonly MinScaleDenominator?: number;
  readonly MaxScaleDenominator?: number;
  readonly Format?: string;
  readonly width?: number;
  readonly height?: number;
};

type ResourceUrl = {
  format: string;
  resourceType: "tile";
  template: string;
};

type CapabilitiesStyle = {
  readonly Identifier: string;
  readonly Title: string;
  readonly Abstract?: string;
  readonly Keywords?: OwsKeywordList;
  readonly LegendURL?: WmtsCapabilitiesLegend | ReadonlyArray<WmtsCapabilitiesLegend>;
  readonly isDefault?: boolean;
};

type CapabilitiesJson = {
  readonly version: string;
  readonly Contents?: Contents;
  readonly ServiceIdentification?: ServiceIdentification;
  readonly ServiceProvider?: ServiceProvider;
  readonly OperationsMetadata?: OperationsMetadata;
  readonly ServiceMetadataURL?: OnlineResource;
};

type Xml = {
  version: string;
  encoding: string;
};

type Capabilities = {
  "?xml": Xml;
  Capabilities: CapabilitiesJson;
};

type OperationsMetadata = {
  readonly Operation: Operation;
};

type Operation = {
  name: string;
  DCP: {
    HTTP: {
      Get?: OnlineResource;
    };
  };
};

type OnlineResource = {
  "xlink:type"?: string;
  "xlink:href": string;
};

type ServiceIdentification = {
  readonly Title?: string;
  readonly Abstract?: string;
  readonly Fees?: string;
  readonly AccessConstraints?: string;
  readonly Keywords?: OwsKeywordList;
  readonly ServiceType: string;
  readonly ServiceTypeVersion: string;
};

type ServiceProvider = {
  readonly ProviderName?: string;
  readonly ProviderSite?: OnlineResource;
  readonly ServiceContact?: ServiceContact;
};

type ServiceContact = {
  readonly InvidualName?: string;
  readonly PositionName?: string;
  readonly ContactInfo?: ContactInfo;
  readonly Role?: string;
};

type ContactInfo = {
  Phone?: Phone;
  Address?: ContactInfoAddress;
  OnlineResource?: OnlineResource;
  HoursOfService?: string;
  ContactInstructions?: string;
};

type ContactInfoAddress = {
  AddressType?: string;
  DeliveryPoint?: string;
  City?: string;
  AdministrativeArea?: string;
  PostalCode?: string;
  Country?: string;
  ElectronicMailAddress?: string;
};

type Phone = {
  Voice?: string;
  Facsimile?: string;
};

type Contents = {
  readonly Layer: WmtsLayer;
  readonly TileMatrixSet: TileMatrixSet;
};

type TileMatrixSetLink = {
  readonly TileMatrixSet: string;
  readonly TileMatrixSetLimits: TileMatrixSetLimits;
};

type TileMatrixSetLimits = {
  readonly TileMatrixLimits: TileMatrixLimits[];
};

type TileMatrixLimits = {
  readonly TileMatrix: any;
  readonly MinTileRow: number;
  readonly MaxTileRow: number;
  readonly MinTileCol: number;
  readonly MaxTileCol: number;
};

type TileMatrixSet = {
  readonly Identifier: string;
  readonly Title?: string;
  readonly Abstract?: string;
  readonly Keyword?: OwsKeywordList;
  readonly SupportedCRS?: string;
  readonly WellKnowScaleSet?: string;
  readonly TileMatrix: TileMatrix[];
};

type TileMatrix = {
  readonly Identifier: string;
  readonly Title?: string;
  readonly Abstract?: string;
  readonly Keyword?: OwsKeywordList;
  readonly ScaleDenominator: number;
  readonly TopLeftCorner: string; // there is a wrong indication of TopLevelPoint in WMTS 1.0.0 specification
  readonly TileWidth: number;
  readonly TileHeight: number;
  readonly MatrixWidth: number;
  readonly MatrixHeight: number;
};

type BoundingBox = {
  LowerCorner: string;
  UpperCorner: string;
  crs?: string;
  dimensions?: string;
};

type OwsKeywordList = {
  readonly Keyword: string | string[];
  readonly type?: string;
};

type UsableTileMatrixSets = {
  identifiers: string[];
  tileWidth: number;
  tileHeight: number;
};

type WmtsCapabilities = {
  layers: WmtsLayer[];
  tileMatrixSets: TileMatrixSet[];
};
