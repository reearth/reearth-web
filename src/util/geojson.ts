import { getCoord as turfGetCoord, getCoords as turfGetCoords } from "@turf/turf";
import type { Geometry, GeometryCollection } from "geojson";

export const getCoord = wrap(turfGetCoord);
export const getCoords = wrap(turfGetCoords);

export const getGeom = (g: any): Exclude<Geometry, GeometryCollection<Geometry>> | undefined => {
  if (typeof g !== "object" || !g || !("type" in g)) return;

  if (g.type === "Feature") return getGeom(g.geometry);

  if (
    g.type !== "Point" &&
    g.type !== "MultiPoint" &&
    g.type !== "LineString" &&
    g.type !== "MultiLineString" &&
    g.type !== "Polygon" &&
    g.type !== "MultiPolygon"
  )
    return;

  return g;
};

function wrap<T>(f: (d: any) => T): (d: any) => T | undefined {
  return (d: any) => {
    try {
      return f(d);
    } catch {
      return;
    }
  };
}
