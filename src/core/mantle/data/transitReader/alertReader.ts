import Pbf from "pbf";

import { EntitySelectorReader } from "./entitySelectorReader";
import { Alert, AlertCause, AlertEffect } from "./gtfsInterface";
import { ProtobufMessageReader } from "./pbfMessageReader";
import { TimeRangeReader } from "./timeRangeReader";
import { TranslatedStringReader } from "./translatedStringReader";

export class AlertReader extends ProtobufMessageReader<Alert> {
  readonly defaultMessage: Alert = {
    active_period: [],
    informed_entity: [],
    cause: AlertCause.CONSTRUCTION,
    effect: AlertEffect.STOP_MOVED,
    url: null,
    header_text: null,
    description_text: null,
  };

  protected readField(tag: number, obj = {} as Alert, pbf: Pbf): void {
    if (tag === 1)
      obj.active_period?.push(new TimeRangeReader().read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 5)
      obj.informed_entity?.push(new EntitySelectorReader().read(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 6) obj.cause = pbf.readVarint();
    else if (tag === 7) obj.effect = pbf.readVarint();
    else if (tag === 8)
      obj.url = new TranslatedStringReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 10)
      obj.header_text = new TranslatedStringReader().read(pbf, pbf.readVarint() + pbf.pos);
    else if (tag === 11)
      obj.description_text = new TranslatedStringReader().read(pbf, pbf.readVarint() + pbf.pos);
  }
}
