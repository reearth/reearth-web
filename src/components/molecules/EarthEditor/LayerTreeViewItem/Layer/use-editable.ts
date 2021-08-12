import React, { useState, useEffect, useRef, useCallback } from "react";
import { useClickAway } from "react-use";

export default function ({
  name,
  renamable,
  onRename,
}: {
  name?: string;
  renamable?: boolean;
  onClick?: () => void;
  onRename?: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState(name || "");
  const editingNameRef = useRef(editingName);

  const startEditing = useCallback(() => {
    if (!renamable) return;
    setEditing(true);
  }, [renamable]);

  const finishEditing = useCallback(() => {
    setEditing(false);
  }, []);

  const resetEditing = useCallback(() => {
    editingNameRef.current = name || "";
    setEditingName(name || "");
  }, [name]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        finishEditing();
      } else if (e.key === "Escape") {
        resetEditing();
        finishEditing();
      }
    },
    [resetEditing, finishEditing],
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    editingNameRef.current = e.currentTarget.value;
    setEditingName(e.currentTarget.value);
  }, []);

  useEffect(() => {
    resetEditing();
  }, [resetEditing]);

  useEffect(
    () =>
      editing
        ? () => {
            if (name !== editingNameRef.current) {
              onRename?.(editingNameRef.current);
            }
            resetEditing();
          }
        : undefined,
    [editing, name, onRename, resetEditing],
  );

  const inputRef = useRef<HTMLInputElement>(null);
  useClickAway(inputRef, finishEditing);

  return {
    editing,
    startEditing,
    finishEditing,
    inputProps: {
      value: editingName,
      ref: inputRef,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onBlur: finishEditing,
    },
  };
}
