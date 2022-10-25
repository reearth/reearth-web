/// <reference types="vite/client" />

declare module "*.yml" {
  const yml: any;
  export default yml;
}

declare module "*.yaml" {
  const yml: any;
  export default yml;
}

declare global {
  interface Window {
    React?: any;
    ReactDOM?: any;
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ImportMetaEnv {}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "@mapbox/martini" {
  export default class Martini {
    constructor(gridSize = 257);
    createTile(terrain: ArrayLike<number>): Tile;
  }

  export class Tile {
    constructor(terrain: ArrayLike<number>, martini: Martini);
    update(): void;
    getMesh(maxError = 0): { vertices: Uint16Array; triangles: Uint32Array };
  }
}
