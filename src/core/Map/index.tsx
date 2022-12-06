import { EngineComponent } from "./types";

export type { EngineComponent, EngineRef } from "./types";

export type { NaiveLayer, LazyLayer, Ref as LayersRef } from "./Layers";

export type Props = {
  engines?: Record<string, EngineComponent>;
};

export default function Map(_props: Props): JSX.Element | null {
  return null;
}
