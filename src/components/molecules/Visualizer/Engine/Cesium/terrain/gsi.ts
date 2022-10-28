import Martini from "@mapbox/martini";
import {
  EllipsoidTerrainProvider,
  Cartographic,
  Rectangle,
  Ellipsoid,
  WebMercatorTilingScheme,
  TerrainProvider,
  Math as CesiumMath,
  Event as CesiumEvent,
  Cartesian3,
  BoundingSphere,
  QuantizedMeshTerrainData,
  HeightmapTerrainData,
  OrientedBoundingBox,
  Credit,
  TileAvailability,
} from "cesium";
import type { NdArray } from "ndarray";
import ndarray from "ndarray";

export const defaultTerrainProvider = new EllipsoidTerrainProvider();

interface CanvasRef {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
}

// github.com/Kanahiro/cesium-gsi-terrain (MIT license, modified)
// https://github.com/Kanahiro/cesium-gsi-terrain/blob/master/src/terrain-provider.ts
export default class GsiTerrainProvider implements TerrainProvider {
  martini: Martini;
  ready: boolean;
  readyPromise: Promise<boolean>;
  tilingScheme: TerrainProvider["tilingScheme"];
  availability: TileAvailability;
  ellipsoid: Ellipsoid;
  contextQueue: CanvasRef[];

  hasWaterMask = false;
  hasVertexNormals = false;
  errorEvent = new CesiumEvent();
  credit = new Credit("地理院タイル");
  tileSize = 256;

  constructor(opts?: { ellipsoid?: Ellipsoid }) {
    this.martini = new Martini(this.tileSize + 1);
    this.ready = true;
    this.readyPromise = Promise.resolve(true);

    this.errorEvent.addEventListener(console.log, this);
    this.ellipsoid = opts?.ellipsoid ?? Ellipsoid.WGS84;

    this.tilingScheme = new WebMercatorTilingScheme({
      numberOfLevelZeroTilesX: 1,
      numberOfLevelZeroTilesY: 1,
      ellipsoid: this.ellipsoid,
    });
    this.availability = new TileAvailability(this.tilingScheme, 14);
    this.contextQueue = [];
  }

  getTileDataAvailable(x: number, y: number, z: number) {
    return z <= 14;
  }

  async loadTileDataAvailability() {
    return;
  }

  async requestTileGeometry(x: number, y: number, z: number) {
    const err = this.getLevelMaximumGeometricError(z);
    const url = `https://cyberjapandata.gsi.go.jp/xyz/dem_png/${z}/${x}/${y}.png`;

    try {
      const pxArray = await this.getTilePixels(url);
      const pixelData = pxArray.data;
      const pixels = ndarray(
        new Uint8Array(pixelData),
        [this.tileSize, this.tileSize, 4],
        [4, 4 * this.tileSize, 1],
        0,
      );
      const terrain = GsiTerrainProvider.gsiTerrainToGrid(pixels);

      // set up mesh generator for a certain 2^k+1 grid size
      // generate RTIN hierarchy from terrain data (an array of size^2 length)
      const tile = this.martini.createTile(terrain);

      // get a mesh (vertices and triangles indices) for a 10m error
      const mesh = tile.getMesh(err);

      return this.createQuantizedMeshData(x, y, z, tile, mesh);
    } catch (err) {
      // We fall back to a heightmap
      const v = Math.max(32 - 4 * z, 4);
      return GsiTerrainProvider.emptyHeightmap(v);
    }
  }

  async createQuantizedMeshData(x: number, y: number, z: number, tile: any, mesh: any) {
    const err = this.getLevelMaximumGeometricError(z);
    const skirtHeight = err * 5;

    const xvals: number[] = [];
    const yvals: number[] = [];
    const heightMeters: number[] = [];
    const northIndices: number[] = [];
    const southIndices: number[] = [];
    const eastIndices: number[] = [];
    const westIndices: number[] = [];

    for (let ix = 0; ix < mesh.vertices.length / 2; ix++) {
      const vertexIx = ix;
      const px = mesh.vertices[ix * 2];
      const py = mesh.vertices[ix * 2 + 1];
      heightMeters.push(tile.terrain[py * (this.tileSize + 1) + px]);

      if (py == 0) northIndices.push(vertexIx);
      if (py == this.tileSize) southIndices.push(vertexIx);
      if (px == 0) westIndices.push(vertexIx);
      if (px == this.tileSize) eastIndices.push(vertexIx);

      // This saves us from out-of-range values like 32768
      const scalar = 32768 / this.tileSize;
      const xv = px * scalar;
      const yv = (this.tileSize - py) * scalar;

      xvals.push(xv);
      yvals.push(yv);
    }

    const maxHeight = Math.max(...heightMeters);
    const minHeight = Math.min(...heightMeters);

    const heights = heightMeters.map(d => {
      if (maxHeight - minHeight < 1) return 0;
      return (d - minHeight) * (32767 / (maxHeight - minHeight));
    });

    const tileRect = this.tilingScheme.tileXYToRectangle(x, y, z);
    const tileCenter = Cartographic.toCartesian(Rectangle.center(tileRect));
    // Need to get maximum distance at zoom level
    // tileRect.width is given in radians
    // cos of half-tile-width allows us to use right-triangle relationship
    const cosWidth = Math.cos(tileRect.width / 2); // half tile width since our ref point is at the center
    // scale max height to max ellipsoid radius
    // ... it might be better to use the radius of the entire
    const ellipsoidHeight = maxHeight / this.ellipsoid.maximumRadius;
    // cosine relationship to scale height in ellipsoid-relative coordinates
    const occlusionHeight = (1 + ellipsoidHeight) / cosWidth;

    const scaledCenter = Ellipsoid.WGS84.transformPositionToScaledSpace(tileCenter);
    const horizonOcclusionPoint = new Cartesian3(scaledCenter.x, scaledCenter.y, occlusionHeight);

    let orientedBoundingBox = null;
    let boundingSphere: BoundingSphere;
    if (tileRect.width < CesiumMath.PI_OVER_TWO + CesiumMath.EPSILON5) {
      orientedBoundingBox = OrientedBoundingBox.fromRectangle(tileRect, minHeight, maxHeight);
      boundingSphere = BoundingSphere.fromOrientedBoundingBox(orientedBoundingBox);
    } else {
      // If our bounding rectangle spans >= 90º, we should use the entire globe as a bounding sphere.
      boundingSphere = new BoundingSphere(
        Cartesian3.ZERO,
        // radius (seems to be max height of Earth terrain?)
        6379792.481506292,
      );
    }

    const triangles = new Uint16Array(mesh.triangles);

    // If our tile has greater than ~1º size
    if (tileRect.width > 0.02) {
      // We need to be able to specify a minimum number of triangles...
      return GsiTerrainProvider.emptyHeightmap64;
    }

    const quantizedVertices = new Uint16Array(
      //verts
      [...xvals, ...yvals, ...heights],
    );

    // SE NW NE
    // NE NW SE

    return new QuantizedMeshTerrainData({
      minimumHeight: minHeight,
      maximumHeight: maxHeight,
      quantizedVertices,
      indices: triangles,
      boundingSphere,
      orientedBoundingBox: orientedBoundingBox ?? undefined,
      horizonOcclusionPoint,
      westIndices,
      southIndices,
      eastIndices,
      northIndices,
      westSkirtHeight: skirtHeight,
      southSkirtHeight: skirtHeight,
      eastSkirtHeight: skirtHeight,
      northSkirtHeight: skirtHeight,
      childTileMask: 14,
    });
  }

  getLevelMaximumGeometricError(level: number) {
    const levelZeroMaximumGeometricError =
      TerrainProvider.getEstimatedLevelZeroGeometricErrorForAHeightmap(
        this.tilingScheme.ellipsoid,
        65,
        this.tilingScheme.getNumberOfXTilesAtLevel(0),
      );
    return levelZeroMaximumGeometricError / (1 << level);
  }

  loadImage: (url: string) => Promise<HTMLImageElement> = url =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.addEventListener("load", () => resolve(img));
      img.addEventListener("error", err => reject(err));
      img.crossOrigin = "anonymous";
      img.src = url;
    });

  getCanvas(): CanvasRef {
    let ctx = this.contextQueue.pop();
    if (ctx == null) {
      const canvas = document.createElement("canvas");
      canvas.width = this.tileSize;
      canvas.height = this.tileSize;
      const context = canvas.getContext("2d");

      if (!context || !(context instanceof CanvasRenderingContext2D)) {
        throw new Error("Failed to get 2D context");
      }
      ctx = { canvas, context };
    }
    return ctx;
  }

  getPixels(img: HTMLImageElement | HTMLCanvasElement): ImageData {
    const canvasRef = this.getCanvas();
    const { context } = canvasRef;
    //context.scale(1, -1);
    // Chrome appears to vertically flip the image for reasons that are unclear
    // We can make it work in Chrome by drawing the image upside-down at this step.
    context.drawImage(img, 0, 0, this.tileSize, this.tileSize);
    const pixels = context.getImageData(0, 0, this.tileSize, this.tileSize);
    context.clearRect(0, 0, this.tileSize, this.tileSize);
    this.contextQueue.push(canvasRef);
    return pixels;
  }

  getTilePixels = async (url: string) => {
    const img = await this.loadImage(url);
    return this.getPixels(img);
  };

  static emptyHeightmap64 = this.emptyHeightmap(64);

  static emptyHeightmap(samples: any) {
    return new HeightmapTerrainData({
      buffer: new Uint8Array(Array(samples * samples).fill(0)),
      width: samples,
      height: samples,
    });
  }

  static gsiTerrainToGrid(png: NdArray<Uint8Array>): Float32Array {
    const gridSize = png.shape[0] + 1;
    const terrain = new Float32Array(gridSize * gridSize);
    const tileSize = png.shape[0];

    // decode terrain values
    for (let y = 0; y < tileSize; y++) {
      for (let x = 0; x < tileSize; x++) {
        const yc = y;
        const r = png.get(x, yc, 0);
        const g = png.get(x, yc, 1);
        const b = png.get(x, yc, 2);
        if (r === 128 && g === 0 && b === 0) {
          terrain[y * gridSize + x] = 0;
        } else {
          terrain[y * gridSize + x] =
            r >= 128
              ? r * 655.36 + g * 2.56 + b * 0.01 + -167772.16
              : r * 655.36 + g * 2.56 + b * 0.01;
        }
      }
    }
    // backfill right and bottom borders
    for (let x = 0; x < gridSize - 1; x++) {
      terrain[gridSize * (gridSize - 1) + x] = terrain[gridSize * (gridSize - 2) + x];
    }
    for (let y = 0; y < gridSize; y++) {
      terrain[gridSize * y + gridSize - 1] = terrain[gridSize * y + gridSize - 2];
    }
    return terrain;
  }
}
