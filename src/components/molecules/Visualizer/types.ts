export type Primitive<P = any, IBP = any> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  title?: string;
  property?: P;
  infobox?: Infobox<IBP>;
  isVisible?: boolean;
};

export type Infobox<BP = any> = {
  property?: any;
  blocks?: Block<BP>[];
};

export type Block<P = any> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
};

export type Widget<P = any> = {
  id: string;
  pluginId?: string;
  extensionId?: string;
  property?: P;
};
