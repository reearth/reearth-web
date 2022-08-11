export type GlobalThis = {
  Cesium?: Cesium;
  reearth: Reearth;
  console: {
    readonly log: (...args: any[]) => void;
    readonly error: (...args: any[]) => void;
  };
};

/** Most of the APIs related to Re:Earth are stored in this object. */
export type Reearth = {
  readonly version: string;
  readonly apiVersion: number;
  readonly visualizer: Visualizer;
  readonly ui: UI;
  readonly plugin: Plugin;
  readonly layers: Layers;
  readonly layer?: Layer;
  readonly widget?: Widget;
  readonly block?: Block;
  readonly on: <T extends keyof ReearthEventType>(
    type: T,
    callback: (...args: ReearthEventType[T]) => void,
  ) => void;
  readonly off: <T extends keyof ReearthEventType>(
    type: T,
    callback: (...args: ReearthEventType[T]) => void,
  ) => void;
  readonly once: <T extends keyof ReearthEventType>(
    type: T,
    callback: (...args: ReearthEventType[T]) => void,
  ) => void;
};

export type MouseEvent = {
  x?: number;
  y?: number;
  lat?: number;
  lng?: number;
  height?: number;
  layerId?: string;
  delta?: number;
};

export type ReearthEventType = {
  update: [];
  close: [];
  cameramove: [camera: CameraPosition];
  select: [layerId: string | undefined];
  message: [message: any];
  click: [props: MouseEvent];
  doubleclick: [props: MouseEvent];
  mousedown: [props: MouseEvent];
  mouseup: [props: MouseEvent];
  rightclick: [props: MouseEvent];
  rightdown: [props: MouseEvent];
  rightup: [props: MouseEvent];
  middleclick: [props: MouseEvent];
  middledown: [props: MouseEvent];
  middleup: [props: MouseEvent];
  mousemove: [props: MouseEvent];
  mouseenter: [props: MouseEvent];
  mouseleave: [props: MouseEvent];
  wheel: [props: MouseEvent];
};

/** Access to the metadata of this plugin and extension currently executed. */
export type Plugin = {
  readonly id: string;
  readonly extensionId: string;
  readonly extensionType: string;
  readonly property?: any;
};

/** You can operate and get data about layers. */
export type Layers = {
  readonly layers: Layer[];
  readonly selected?: Layer;
  readonly tags?: Tag[];
  readonly selectionReason?: string;
  readonly overriddenInfobox?: OverriddenInfobox;
  readonly overriddenProperties?: { [id: string]: any };
  /** Selects the layer with the specified ID; if the ID is undefined, the currently selected later will be deselected. */
  readonly layersInViewport: Layer[];
  readonly select: (id?: string, options?: SelectLayerOptions) => void;
  readonly show: (...id: string[]) => void;
  readonly hide: (...id: string[]) => void;
  readonly findById: (id: string) => Layer | undefined;
  readonly findByIds: (...id: string[]) => (Layer | undefined)[];
  readonly findByTags: (...tagIds: string[]) => Layer[];
  readonly findByTagLabels: (...tagLabels: string[]) => Layer[];
  readonly find: (
    fn: (layer: Layer, index: number, parents: Layer[]) => boolean,
  ) => Layer | undefined;
  readonly findAll: (fn: (layer: Layer, index: number, parents: Layer[]) => boolean) => Layer[];
  readonly walk: <T>(
    fn: (layer: Layer, index: number, parents: Layer[]) => T | void,
  ) => T | undefined;
  readonly isLayer: (obj: any) => obj is Layer;
  readonly overrideProperty: (id: string, property: any) => void;
  readonly add: (layer: Layer, parentId?: string, creator?: string) => string | undefined;
};

export type SelectLayerOptions = {
  reason?: string;
  overriddenInfobox?: OverriddenInfobox;
};

export type OverriddenInfobox = {
  title?: string;
  content: { key: string; value: string }[];
};

/** Layer is acutually displayed data on the map in which layers are flattened. All properties are stored with all dataset links, etc. resolved. */
export type Layer<P = any, IBP = any> = {
  id: string;
  type?: string;
  pluginId?: string;
  extensionId?: string;
  title?: string;
  property?: P;
  infobox?: Infobox<IBP>;
  isVisible?: boolean;
  propertyId?: string;
  tags?: Tag[];
  readonly children?: Layer<P, IBP>[];
  creator?: string;
};

export type Tag = {
  id: string;
  label: string;
  tags?: Tag[];
};

export type Infobox<BP = any> = {
  property?: InfoboxProperty;
  blocks?: Block<BP>[];
};

export type InfoboxProperty = {
  default?: {
    showTitle?: boolean;
    title?: string;
    height?: number;
    heightType?: "auto" | "manual";
    infoboxPaddingTop?: number;
    infoboxPaddingBottom?: number;
    infoboxPaddingLeft?: number;
    infoboxPaddingRight?: number;
    size?: "small" | "medium" | "large";
    position?: "right" | "middle" | "left";
    typography?: Typography;
    bgcolor?: string;
    outlineColor?: string;
    outlineWidth?: number;
    useMask?: boolean;
  };
};

export type Block<P = any> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
  propertyId?: string;
};

export type Widget<P = any> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
  propertyId?: string;
  extended?: {
    horizontally: boolean;
    vertically: boolean;
  };
  layout?: WidgetLayout;
};

export type WidgetLayout = {
  location: WidgetLocation;
  align: WidgetAlignment;
};

export type WidgetLocation = {
  zone: "inner" | "outer";
  section: "left" | "center" | "right";
  area: "top" | "middle" | "bottom";
};

export type WidgetAlignment = "start" | "centered" | "end";

/** The API for iframes, which is required not only for displaying the UI but also for calling the browser API. */
export type UI = {
  /**
   * Creates a new iframe to show any UI of the plugin or call the web browser API in a hidden way.
   *
   * ```js
   * reearth.ui.show(`<h1>Hello</h1>`);
   * ```
   *
   * How the UI is displayed depends on the type of extension when visible field is true in the options: in the case of widgets, it will be displayed in the place where it is placed on the screen, in the case of blocks, it will be displayed in the infobox field, but in the case of primitives, it will never actually be displayed.
   *
   * The iframe will be automatically resized according to the size of its contents.
   *
   * When `show` has been called again druing the iframe has been already shown, the iframe will be destroyed and then a new iframe will be recreated with the new html and options.
   */
  readonly show: (
    html: string,
    options?: {
      /** If true, display a iframe. Otherwise, hide the iframe and plugin works like headless mdoe. Default value is true. */
      visible?: boolean;
      /** Initial iframe width of the widget. If not specified, the iframe will be automatically resized. If a number is specified, it will be treated as pixels. This option is only available for widgets that are not horizontally extended. */
      width?: number | string;
      /** Initial iframe height of the widget. If not specified, the iframe will be automatically resized. If a number is specified, it will be treated as pixels. This option is only available for widgets that are not vertically extended. */
      height?: number | string;
      /** Override whether the iframe is extended. This option is only available for widgets on an extendable area on the widget align system. */
      extended?: boolean;
    },
  ) => void;
  /**
   * Sends a message to the iframe's window shown by the show method. Sent data will be automatically encoded as JSON and restored in the iframe's window. So any object that cannot be serialized to JSON will be ignored.
   */
  readonly postMessage: (message: any) => void;
  /**
   * Resize the iframe by the plugin. If width or height is undefined, it will be auto-resized. If a number is specified, it will be treated as pixels.
   *
   * If plugins try to resize the iframe by specifying size in the iframe's internal HTML, for example, in the body style, or by updating the CSS, iframe will not actually be resized. In that case, plugins need to call this method explicitly to resize the iframe.
   */
  readonly resize: (
    /** Width of the iframe of the widget. This field is only available for widgets that are not horizontally extended. */
    width: string | number | undefined,
    /** Height of the iframe of the widget. This field is only available for widgets that are not vertically extended. */
    height: string | number | undefined,
    /** Overrides whether the iframe is extended. This option is only available for widgets on an extendable area on the widget align system. */
    extended?: boolean | undefined,
  ) => void;
};

/** The API for the visualizer. This works regardless of the visualization engine you are using, which ensures the versatility of the plugin. It is recommended that you use this API whenever possible, and call the visualization engine's own low-layer API only when there is something you cannot do. */
export type Visualizer = {
  /** Current visualization engine type. Currently only "cesium" is available. */
  readonly engine: string;
  readonly camera: Camera;
  readonly clock?: Clock;
  /** Current scene property */
  readonly property?: any;
  readonly overrideProperty: (property: any) => void;
};

type Rect = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type Camera = {
  /** Current camera position */
  readonly position: CameraPosition | undefined;
  readonly viewport: Rect | undefined;
  readonly zoomIn: (amount: number) => void;
  readonly zoomOut: (amount: number) => void;
  /** Moves the camera position to the specified destination. */
  readonly flyTo: (destination: FlyToDestination, options?: CameraOptions) => void;
  /** Moves the camera position to look at the specified destination. */
  readonly lookAt: (destination: LookAtDestination, options?: CameraOptions) => void;
};

/** Represents the camera position and state */
export type CameraPosition = {
  /** degrees */
  lat: number;
  /** degrees */
  lng: number;
  /** meters */
  height: number;
  /** radians */
  heading: number;
  /** radians */
  pitch: number;
  /** radians */
  roll: number;
  /** Field of view expressed in radians */
  fov: number;
};

export type Typography = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  color?: string;
  textAlign?: "left" | "center" | "right" | "justify" | "justify_all";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

/**
 * Undefined fields are assumed to be the same as the current camera position.
 */
export type FlyToDestination = {
  /** degrees */
  lat?: number;
  /** degrees */
  lng?: number;
  /** meters */
  height?: number;
  /** radians */
  heading?: number;
  /** radians */
  pitch?: number;
  /** radians */
  roll?: number;
  /** Field of view expressed in radians */
  fov?: number;
};

/**
 * Undefined fields are assumed to be the same as the current camera position.
 */
export type LookAtDestination = {
  /** degrees */
  lat?: number;
  /** degrees */
  lng?: number;
  /** meters */
  height?: number;
  /** radians */
  heading?: number;
  /** radians */
  pitch?: number;
  /** radians */
  range?: number;
  /** Field of view expressed in radians */
  fov?: number;
};

export type CameraOptions = {
  /** Expressed in seconds. Default is zero. */
  duration?: number;
  /** Easing function. */
  easing?: (time: number) => number;
};

/** Cesium API: available only when the plugin is a primitive */
export type Cesium = {};

type ClockEventHandler<R = void> = (cb: (clock: Clock) => void) => R;
export type Clock = {
  startTime: Date;
  stopTime: Date;
  currentTime: Date;
  tick: () => Date;
  isPlaying: boolean;
  onTick: {
    addEventListener: ClockEventHandler<() => void>;
    removeEventListener: ClockEventHandler;
  };
};
