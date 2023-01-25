import Pbf from "pbf";

import { Translation } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";

export class TranslationReader extends ProtobufMessageReader<Translation> {
  readonly defaultMessage: Translation = { text: "", language: "" };

  protected readField(tag: number, obj = {} as Translation, pbf: Pbf): void {
    if (tag === 1) obj.text = pbf.readString();
    else if (tag === 2) obj.language = pbf.readString();
  }
}
