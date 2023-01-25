import Pbf from "pbf";

export abstract class ProtobufMessageReader<T> {
  abstract readonly defaultMessage: T;

  public read(pbf: Pbf, end?: number): T {
    return pbf.readFields(this.readField, this.defaultMessage, end);
  }

  protected abstract readField(tag: number, obj?: T, pbf?: Pbf): void;
}
