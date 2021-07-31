import { useCallback, useState } from "react";

export default (onSend?: () => void, loading?: boolean) => {
  const [isOpen, open] = useState(false);
  const [validationErr, setValidationErr] = useState("");
  const [repoUrl, setRepoUrl] = useState("");

  const handleOpen = () => open(true);

  const handleRepoUrlChange = (text: string) => {
    setRepoUrl(text);
  };

  const handleClose = useCallback(() => {
    if (!loading) {
      open(false);
      setRepoUrl("");
      setValidationErr("");
    }
  }, [loading]);

  const handleSubmit = useCallback(() => {
    const err = validateUrl(repoUrl);
    if (err) return;
    onSend?.();
    handleClose();
  }, [handleClose, onSend, repoUrl]);

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setValidationErr("Error: Thie field is required");
      return true;
    }
    if (!/https:\/\/github\.com\/([\w-_%]|\.)+/.test(url)) {
      setValidationErr("Error: Invalid GitHub repository URL");
      return true;
    }
    setValidationErr("");
    return false;
  };

  return {
    isOpen,
    validationErr,
    repoUrl,
    handleRepoUrlChange,
    handleOpen,
    handleSubmit,
    handleClose,
  };
};
