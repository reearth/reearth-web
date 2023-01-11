import { useRef } from "react";

import type { Ref as MapRef } from "../Map";

export default function useHooks() {
  const mapRef = useRef<MapRef>(null);

  return {
    mapRef,
  };
}
