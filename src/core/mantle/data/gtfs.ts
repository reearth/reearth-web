import Pbf from "pbf";
import { useEffect, useState } from "react";

import type { Data, DataRange, Feature } from "../types";

import { Trips, Trip, GTFS, GTFSReader } from "./transitReader";
// import { OccupancyStatus } from "./transitReader";
import { f } from "./utils";

export async function useFetchGTFS(data: Data, range?: DataRange): Promise<Feature[] | void> {
  const [gtfs, setData] = useState<GTFS>();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const arrayBuffer = data.url ? await (await f(data.url)).arrayBuffer() : data.value;
        const pbfBuffer = new Pbf(new Uint8Array(arrayBuffer));
        const gtfs = new GTFSReader().read(pbfBuffer);
        setData(gtfs);
      } catch (err) {
        throw new Error(`failed to generate ast: ${err}`);
      }
    };
    fetchData();

    // default refresh time as 10s
    const refreshTime = data.refreshInterval ? data.refreshInterval * 1000 : 10000;

    const inverval = setInterval(fetchData, refreshTime);
    return () => clearInterval(inverval);
  });

  return useProcessGTFS(gtfs, range);
}

export function useProcessGTFS(gtfs?: GTFS, _range?: DataRange): Feature[] {
  const [current, setCurrent] = useState<Trips>();
  const [previous, setPrevious] = useState<Trips>();
  const [tripsData, setTripsData] = useState<Trips>();

  useEffect(() => {
    if (gtfs) {
      if (current) {
        setPrevious(current);
        const currentTrips = GTFStoTrips(gtfs);
        setCurrent(currentTrips);
        const merged = mergeTrips(currentTrips, previous);
        setTripsData(merged);
      } else {
        const currentTrips = GTFStoTrips(gtfs);
        setCurrent(currentTrips);
        setTripsData(currentTrips);
      }
    }
  }, [current, gtfs, previous]);

  console.log(tripsData);

  // tripsData.trips contains everything that's needed for producing a model or a point i.e vehicle location etc.
}

export const GTFStoTrips = (gtfs: GTFS): Trips => {
  const trips = gtfs.entities?.map(entity => ({
    id: entity.id,
    properties: entity.vehicle,
    path: [[entity.vehicle?.position?.longitude, entity.vehicle?.position?.latitude]],
    timestamps: [entity.vehicle?.timestamp],
  }));
  return {
    timestamp: gtfs.header?.timestamp,
    trips: trips as Trip[],
  };
};

export const mergeTrips = (current: Trips, prev?: Trips) => {
  if (prev) {
    const prevMap = new Map();
    prev.trips.forEach(trip => {
      prevMap.set(trip.id, trip);
    });
    const mergedMap = new Map();
    const newIds: string[] = [];
    current.trips.forEach(entity => {
      const previousEntity = prevMap.get(entity.id);
      if (previousEntity) {
        const previousPath = previousEntity.path;
        const previousTimestamps = previousEntity.timestamps;
        const trip = {
          id: entity.id,
          properties: entity.properties,
          path: [...previousPath, ...entity.path],
          timestamps: [...previousTimestamps, ...entity.timestamps],
        };
        mergedMap.set(entity.id, trip);
      } else {
        mergedMap.set(entity.id, entity);
        newIds.push(entity.id);
      }
    });
    const trips = Object.fromEntries(mergedMap);
    const mergedTrips = Object.values(trips).filter(
      entity =>
        newIds.includes((entity as Trip).id) ||
        (entity as Trip).path.length > prevMap.get((entity as Trip).id).path.length,
    );
    return {
      timestamp: current.timestamp,
      trips: mergedTrips as Trip[],
    };
  }
  return current;
};

// const getBusColor = (d: Trip): string => {
//   switch (d.properties.occupancy_status) {
//     case OccupancyStatus.FULL:
//       return "#cf222e";
//     case OccupancyStatus.STANDING_ROOM_ONLY:
//       return "#dc6d1a";
//     case OccupancyStatus.FEW_SEATS_AVAILABLE:
//       return "#f6e05e";
//     default:
//       return "#0969da";
//   }
// };
