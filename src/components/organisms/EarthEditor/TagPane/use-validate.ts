import { useCallback } from "react";
import { useIntl } from "react-intl";

import { TagGroup } from "@reearth/components/molecules/EarthEditor/TagPane";

type Validator = (...args: any[]) => string | null;

type TagValidator = {
  dupulicatedTagGgroupLabel: Validator;
  dupulicatedTagItemLabel: Validator;
  nonEmptyTagGroup: Validator;
};
export default (): TagValidator => {
  const intl = useIntl();
  const doesSameLabelTagGroupExist = useCallback(
    (tagGroups: TagGroup[], label: string) => {
      return tagGroups.map(tg => tg.label).includes(label)
        ? intl.formatMessage({
            defaultMessage: "Same label tag already exist. Please type different label.",
          })
        : null;
    },
    [intl],
  );

  const doesSameLabelTagItemExist = useCallback(
    (tagGroup: TagGroup, label: string) => {
      return tagGroup?.tagItems?.map(t => t.label).includes(label)
        ? intl.formatMessage({
            defaultMessage: "Same label tag already exist. Please type different label.",
          })
        : null;
    },
    [intl],
  );

  const doesTagGroupHaveTags = useCallback(
    (tagGroup?: TagGroup) => {
      return tagGroup?.tagItems.length
        ? intl.formatMessage({
            defaultMessage: "Tag group has tags, you need to remove all tags under the tag group",
          })
        : null;
    },
    [intl],
  );

  return {
    dupulicatedTagGgroupLabel: doesSameLabelTagGroupExist,
    dupulicatedTagItemLabel: doesSameLabelTagItemExist,
    nonEmptyTagGroup: doesTagGroupHaveTags,
  };
};
