import React, { useCallback, useState } from "react";
import { useFormik } from "formik";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import { Icons } from "@reearth/components/atoms/Icon";
import Loading from "@reearth/components/atoms/Loading";
import Modal from "@reearth/components/atoms/Modal";
import { useTheme } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";
import PluginInstallCardButton from "../PluginInstallCardButton";
import TextBox from "@reearth/components/atoms/TextBox";
import Box from "@reearth/components/atoms/Box";

export type Props = {
  className?: string;
  icon: Icons;
  text: string;
  // onClick?: () => void;
  onSend?: () => void;
};

const PublicRepo: React.FC<Props> = ({ className, icon, text, onSend }) => {
  const [isOpen, open] = useState(false);
  const [validationErr, setValidationErr] = useState("");
  const formik = useFormik({
    initialValues: { repoUrl: "" },
    onSubmit: useCallback(() => {
      console.log("submit!");
      onSend?.();
    }, [onSend]),
  });

  const handleOpen = () => open(true);

  const handleClose = useCallback(() => {
    if (!formik.isSubmitting) {
      open(false);
      formik.resetForm();
    }
  }, [formik]);

  const handleSubmit = useCallback(() => {
    formik.submitForm();
    handleClose();
  }, [formik, handleClose]);

  const handleCancel = () => console.log("cancel");

  const validate = (repoUrl: string) => {
    if (!repoUrl) {
      setValidationErr("Error: Thie field is required");
      return;
    }
    if (!/https:\/\/github\.com\/([\w-_%]|\.)+/.test(repoUrl)) {
      setValidationErr("Error: Invalid GitHub repository URL");
      return;
    }
    setValidationErr("");
  };
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      console.log("blue---", e);
      formik.handleBlur(e);
      validate(formik.values.repoUrl);
    },
    [formik],
  );
  const intl = useIntl();
  const theme = useTheme();
  return (
    <>
      <PluginInstallCardButton className={className} icon={icon} text={text} onClick={handleOpen} />
      <Modal
        title={intl.formatMessage({ defaultMessage: "Import GitHub repository" })}
        isVisible={isOpen}
        onClose={handleClose}
        button1={
          <Button
            large
            buttonType="primary"
            text={intl.formatMessage({ defaultMessage: "Continue" })}
            disabled={!formik.values.repoUrl}
            onClick={handleSubmit}
          />
        }
        button2={
          <Button
            large
            buttonType="secondary"
            text={intl.formatMessage({ defaultMessage: "Cancel" })}
            onClick={handleCancel}
          />
        }>
        {formik.isSubmitting && <Loading overlay />}
        {/* {({ touched }) => (
          <form onSubmit={formik.handleSubmit}> */}
        <Text size="m" color={theme.colors.text.main}>
          {intl.formatMessage({ defaultMessage: "Repository url:" })}
        </Text>
        <Box mv="l">
          <TextBox {...formik.getFieldProps("repoUrl")} onBlur={handleBlur} />
        </Box>
        {validationErr && (
          <Text size="2xs" color={theme.colors.danger.main}>
            {validationErr}
          </Text>
        )}
        {/* </form> */}
        {/* )} */}
      </Modal>
    </>
  );
};

export default PublicRepo;
