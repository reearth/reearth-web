import Pbf from "pbf";

import { TranslatedString } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";
import { TranslationReader } from "./translationReader";

export class TranslatedStringReader extends ProtobufMessageReader<TranslatedString> {
  readonly defaultMessage: TranslatedString = { translation: [] };

  protected readField(tag: number, obj = {} as TranslatedString, pbf: Pbf): void {
    if (tag === 1)
      obj.translation?.push(new TranslationReader().read(pbf, pbf.readVarint() + pbf.pos));
  }
}
