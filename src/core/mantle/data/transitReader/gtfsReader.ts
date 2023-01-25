import Pbf from "pbf";

import { EntityReader } from "./entityReader";
import { GTFS } from "./gtfsInterface";
import { HeaderReader } from "./headerReader";
import { ProtobufMessageReader } from "./pbfMessageReader";

export class GTFSReader extends ProtobufMessageReader<GTFS> {
  readonly defaultMessage: GTFS = {
    header: null,
    entities: [],
  };

  protected readField(tag: number, obj = {} as GTFS, pbf: Pbf): void {
    if (tag === 1) obj.header = new HeaderReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 2)
      obj.entities?.push(new EntityReader().read(pbf, pbf.readVarint() + pbf.pos));
  }
}
