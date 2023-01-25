import Pbf from "pbf";

import { AlertReader } from "./alertReader";
import { Entity } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";
import { TripUpdateReader } from "./tripUpdateReader";
import { VehiclePositionReader } from "./vehiclePositionReader";

export class EntityReader extends ProtobufMessageReader<Entity> {
  readonly defaultMessage: Entity = {
    id: "",
    is_deleted: false,
    trip_update: null,
    vehicle: null,
    alert: null,
  };

  protected readField(tag: number, obj = {} as Entity, pbf: Pbf): void {
    if (tag === 1) obj.id = pbf.readString();
    else if (tag === 2) obj.is_deleted = pbf.readBoolean();
    else if (tag === 3)
      obj.trip_update = new TripUpdateReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 4)
      obj.vehicle = new VehiclePositionReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 5) obj.alert = new AlertReader().read(pbf, pbf.readVarint() + pbf.pos);
  }
}
