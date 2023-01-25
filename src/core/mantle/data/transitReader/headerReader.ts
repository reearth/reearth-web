import Pbf from "pbf";

import { Header, HeaderIncrementality } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";

export class HeaderReader extends ProtobufMessageReader<Header> {
  readonly defaultMessage: Header = {
    gtfs_realtime_version: "",
    incrementality: HeaderIncrementality.FULL_DATASET,
    timestamp: 0,
  };

  protected readField(tag: number, obj = {} as Header, pbf: Pbf): void {
    if (tag === 1) obj.gtfs_realtime_version = pbf.readString();
    else if (tag === 2) obj.incrementality = pbf.readVarint();
    else if (tag === 3) obj.timestamp = pbf.readVarint();
  }
}
