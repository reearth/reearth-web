import Pbf from "pbf";

import { StopTimeEvent } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";

export class StopTimeEventReader extends ProtobufMessageReader<StopTimeEvent> {
  readonly defaultMessage: StopTimeEvent = {
    delay: 0,
    time: 0,
    uncertainty: 0,
  };

  protected readField(tag: number, obj = {} as StopTimeEvent, pbf: Pbf): void {
    if (tag === 1) obj.delay = pbf.readVarint(true);
    else if (tag === 2) obj.time = pbf.readVarint(true);
    else if (tag === 3) obj.uncertainty = pbf.readVarint(true);
  }
}
