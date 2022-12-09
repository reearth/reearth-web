import { useRef } from "react";

import { EngineRef } from "./types";

export default function () {
  const engineRef = useRef<EngineRef>(null);

  return {
    engineRef,
  };
}
