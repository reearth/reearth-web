import React, { useCallback } from "react";

import Tag from "@reearth/components/atoms/Tag";

export type TagItem = {
  id: string;
  label: string;
};

export type Props = {
  className?: string;
  tagItem: TagItem;
  icon?: "bin" | "cancel";
  onRemove?: (tagId: string) => void;
};

const TagItem: React.FC<Props> = ({ className, tagItem, icon, onRemove }) => {
  const handleRemove = useCallback(() => {
    onRemove?.(tagItem.id);
  }, [onRemove, tagItem.id]);
  return <Tag className={className} label={tagItem.label} onRemove={handleRemove} icon={icon} />;
};

export default TagItem;
