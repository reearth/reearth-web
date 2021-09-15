import { useState, useEffect, useCallback } from "react";

import generateRandomString from "@reearth/util/generate-random-string";

export type Validation = "too short" | "not match";
export type CopiedItemKey = {
  url?: boolean;
  embedCode?: boolean;
};

export default (
  defaultAlias?: string,
  onClose?: () => void,
  onAliasValidate?: (alias: string) => void,
  onCopyToClipBoard?: () => void,
) => {
  const [copiedKey, setCopiedKey] = useState<CopiedItemKey>();
  const [alias, changeAlias] = useState(defaultAlias);
  const [validation, changeValidation] = useState<Validation>();
  const [statusChanged, setStatusChange] = useState(false);
  const [showOptions, setOptions] = useState(!defaultAlias);

  const resetCopiedWithDelay = useCallback((key: keyof CopiedItemKey) => {
    const timerID = setTimeout(
      () =>
        setCopiedKey(prevState => ({
          ...prevState,
          [key]: false,
        })),
      2500,
    );
    return () => clearTimeout(timerID);
  }, []);

  const handleCopyToClipBoard = useCallback(
    (key: keyof CopiedItemKey, value: string | undefined) =>
      (_: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
        if (!value) return;
        setCopiedKey(prevState => ({
          ...prevState,
          [key]: true,
        }));
        navigator.clipboard.writeText(value);
        onCopyToClipBoard?.();
        resetCopiedWithDelay(key);
      },
    [resetCopiedWithDelay, onCopyToClipBoard],
  );

  const validate = useCallback(
    (a?: string) => {
      if (!a) {
        changeValidation(undefined);
        return;
      }
      if (a.length < 5) {
        changeValidation("too short");
      } else if (!/^[A-Za-z0-9_-]*$/.test(a)) {
        changeValidation("not match");
      } else {
        changeValidation(undefined);
        onAliasValidate?.(a);
      }
    },
    [onAliasValidate],
  );

  const onAliasChange = useCallback(
    (value?: string) => {
      const a = value || generateAlias();
      changeAlias(a);
      validate(a);
    },
    [validate], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleClose = useCallback(() => {
    onClose?.();
    onAliasChange(defaultAlias);
    setStatusChange(false);
    setOptions(defaultAlias ? false : true);
  }, [onClose, defaultAlias]); // eslint-disable-line react-hooks/exhaustive-deps

  const generateAlias = useCallback(() => {
    const str = generateRandomString(10);
    changeAlias(str);
    return str;
  }, []);

  useEffect(() => {
    onAliasChange(defaultAlias);
  }, [defaultAlias]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    handleClose,
    statusChanged,
    setStatusChange,
    alias,
    validation,
    generateAlias,
    copiedKey,
    handleCopyToClipBoard,
    showOptions,
    setOptions,
  };
};
