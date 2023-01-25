import Pbf from "pbf";

import {
  VehicleStopStatus,
  CongestionLevel,
  OccupancyStatus,
  VehiclePosition,
} from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";
import { PositionReader } from "./positionReader";
import { TripDescriptorReader } from "./tripDescriptorReader";
import { VehicleDescriptorReader } from "./vehicleDescriptorReader";

export class VehiclePositionReader extends ProtobufMessageReader<VehiclePosition> {
  readonly defaultMessage: VehiclePosition = {
    trip: null,
    vehicle: null,
    position: null,
    current_stop_sequence: 0,
    stop_id: "",
    current_status: VehicleStopStatus.IN_TRANSIT_TO,
    timestamp: 0,
    congestion_level: CongestionLevel.UNKNOWN_CONGESTION_LEVEL,
    occupancy_status: OccupancyStatus.EMPTY,
  };

  protected readField(tag: number, obj = {} as VehiclePosition, pbf: Pbf): void {
    if (tag === 1) obj.trip = new TripDescriptorReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 8)
      obj.vehicle = new VehicleDescriptorReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2) obj.position = new PositionReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3) obj.current_stop_sequence = pbf.readVarint();
    else if (tag === 7) obj.stop_id = pbf.readString();
    else if (tag === 4) obj.current_status = pbf.readVarint();
    else if (tag === 5) obj.timestamp = pbf.readVarint();
    else if (tag === 6) obj.congestion_level = pbf.readVarint();
    else if (tag === 9) obj.occupancy_status = pbf.readVarint();
  }
}
