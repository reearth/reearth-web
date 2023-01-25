import Pbf from "pbf";

import { TripDescriptor, TripDescriptorScheduleRelationship } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";

export class TripDescriptorReader extends ProtobufMessageReader<TripDescriptor> {
  readonly defaultMessage: TripDescriptor = {
    trip_id: "",
    route_id: "",
    direction_id: 0,
    start_time: "",
    start_date: "",
    schedule_relationship: TripDescriptorScheduleRelationship.SCHEDULED,
  };

  protected readField(tag: number, obj = {} as TripDescriptor, pbf: Pbf): void {
    if (tag === 1) obj.trip_id = pbf.readString();
    else if (tag === 5) obj.route_id = pbf.readString();
    else if (tag === 6) obj.direction_id = pbf.readVarint();
    else if (tag === 2) obj.start_time = pbf.readString();
    else if (tag === 3) obj.start_date = pbf.readString();
    else if (tag === 4) obj.schedule_relationship = pbf.readVarint();
  }
}
