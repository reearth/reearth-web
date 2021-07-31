import { Icons } from "@reearth/components/atoms/Icon";
import Loading from "@reearth/components/atoms/Loading";
import React from "react";
import PluginInstallCardButton from "../PluginInstallCardButton";

export type Props = {
  className?: string;
  icon: Icons;
  buttonText: string;
  onSend?: () => void;
  loading?: boolean;
};

const ZipUpload: React.FC<Props> = ({ className, icon, buttonText, onSend, loading }) => {
  const handleClick = () => {
    console.log("click");
    onSend?.();
  };
  return (
    <>
      {loading ? (
        <Loading overlay />
      ) : (
        <PluginInstallCardButton
          className={className}
          icon={icon}
          text={buttonText}
          onClick={handleClick}
        />
      )}
    </>
  );
};

export default ZipUpload;
