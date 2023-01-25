import Pbf from "pbf";

import { StopTimeUpdate, StopTimeUpdateScheduleRelationship } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";
import { StopTimeEventReader } from "./stopTimeEventReader";

export class StopTimeUpdateReader extends ProtobufMessageReader<StopTimeUpdate> {
  readonly defaultMessage: StopTimeUpdate = {
    stop_sequence: 0,
    stop_id: "",
    arrival: null,
    departure: null,
    schedule_relationship: StopTimeUpdateScheduleRelationship.NO_DATA,
  };

  protected readField(tag: number, obj = {} as StopTimeUpdate, pbf: Pbf): void {
    if (tag === 1) obj.stop_sequence = pbf.readVarint();
    else if (tag === 4) obj.stop_id = pbf.readString();
    else if (tag === 2)
      obj.arrival = new StopTimeEventReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 3)
      obj.departure = new StopTimeEventReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 5) obj.schedule_relationship = pbf.readVarint();
  }
}
