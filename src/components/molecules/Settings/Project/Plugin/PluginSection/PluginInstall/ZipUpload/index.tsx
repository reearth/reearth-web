import React from "react";

export type Props = {
  className?: string;
};

const ZipUpload: React.FC<Props> = ({ className }) => {
  return <div className={className}>something</div>;
};

export default ZipUpload;
