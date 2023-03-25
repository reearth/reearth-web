import { evalSimpleLayerFeature } from "./eval";

self.addEventListener("message", event => {
  const { features, layer, timeIntervals } = event.data;
  const results = features.map((f, i) => {
    const computedFeature = evalSimpleLayerFeature(layer, f, timeIntervals?.[i]);
    return computedFeature;
  });
  self.postMessage(results);
});
