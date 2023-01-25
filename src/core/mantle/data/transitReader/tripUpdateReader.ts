import Pbf from "pbf";

import { TripUpdate } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";
import { StopTimeUpdateReader } from "./stopTimeUpdateReader";
import { TripDescriptorReader } from "./tripDescriptorReader";
import { VehicleDescriptorReader } from "./vehicleDescriptorReader";

export class TripUpdateReader extends ProtobufMessageReader<TripUpdate> {
  readonly defaultMessage: TripUpdate = {
    trip: {},
    vehicle: {},
    stop_time_update: [],
    timestamp: 0,
    delay: 0,
  };

  protected readField(tag: number, obj = {} as TripUpdate, pbf: Pbf): void {
    if (tag === 1) obj.trip = new TripDescriptorReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3)
      obj.vehicle = new VehicleDescriptorReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2)
      obj.stop_time_update?.push(new StopTimeUpdateReader().read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 4) obj.timestamp = pbf.readVarint();
    else if (tag === 5) obj.delay = pbf.readVarint(true);
  }
}
