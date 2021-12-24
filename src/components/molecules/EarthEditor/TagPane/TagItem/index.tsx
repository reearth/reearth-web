import { useCallback } from "hoist-non-react-statics/node_modules/@types/react";
import React from "react";

import Tag from "@reearth/components/atoms/Tag";

export type TagItem = {
  id: string;
  label: string;
};

export type Props = {
  className?: string;
  tagItem: TagItem;
  onRemove?: (tagId: string) => void;
  deletable?: boolean;
};

const TagItem: React.FC<Props> = ({ className, tagItem, onRemove }) => {
  const handleRemove = useCallback(() => {
    onRemove?.(tagItem.id);
  }, [onRemove, tagItem.id]);
  return <Tag className={className} label={tagItem.label} onRemove={handleRemove} />;
};

export default TagItem;
