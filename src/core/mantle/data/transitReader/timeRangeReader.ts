import Pbf from "pbf";

import { TimeRange } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";

export class TimeRangeReader extends ProtobufMessageReader<TimeRange> {
  readonly defaultMessage: TimeRange = {
    start: 0,
    end: 0,
  };

  protected readField(tag: number, obj = {} as TimeRange, pbf: Pbf): void {
    if (tag === 1) obj.start = pbf.readVarint();
    else if (tag === 2) obj.end = pbf.readVarint();
  }
}
