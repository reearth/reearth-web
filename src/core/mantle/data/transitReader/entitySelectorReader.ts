import Pbf from "pbf";

import { EntitySelector } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";
import { TripDescriptorReader } from "./tripDescriptorReader";

export class EntitySelectorReader extends ProtobufMessageReader<EntitySelector> {
  readonly defaultMessage: EntitySelector = {
    agency_id: "",
    route_id: "",
    route_type: 0,
    trip: null,
    stop_id: "",
  };

  protected readField(tag: number, obj = {} as EntitySelector, pbf: Pbf): void {
    if (tag === 1) obj.agency_id = pbf.readString();
    else if (tag === 2) obj.route_id = pbf.readString();
    else if (tag === 3) obj.route_type = pbf.readVarint(true);
    else if (tag === 4) obj.trip = new TripDescriptorReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 5) obj.stop_id = pbf.readString();
  }
}
