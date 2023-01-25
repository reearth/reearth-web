import Pbf from "pbf";

import { VehicleDescriptor } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";

export class VehicleDescriptorReader extends ProtobufMessageReader<VehicleDescriptor> {
  readonly defaultMessage: VehicleDescriptor = {
    id: "",
    label: "",
    license_plate: "",
  };

  protected readField(tag: number, obj = {} as VehicleDescriptor, pbf: Pbf): void {
    if (tag === 1) obj.id = pbf.readString();
    else if (tag === 2) obj.label = pbf.readString();
    else if (tag === 3) obj.license_plate = pbf.readString();
  }
}
