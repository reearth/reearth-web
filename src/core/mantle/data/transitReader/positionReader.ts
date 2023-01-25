import Pbf from "pbf";

import { Position } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";

export class PositionReader extends ProtobufMessageReader<Position> {
  readonly defaultMessage: Position = {
    latitude: 0,
    longitude: 0,
    bearing: 0,
    odometer: 0,
    speed: 0,
  };

  protected readField(tag: number, obj = {} as Position, pbf: Pbf): void {
    if (tag === 1) obj.latitude = pbf.readFloat();
    else if (tag === 2) obj.longitude = pbf.readFloat();
    else if (tag === 3) obj.bearing = pbf.readFloat();
    else if (tag === 4) obj.odometer = pbf.readDouble();
    else if (tag === 5) obj.speed = pbf.readFloat();
  }
}
