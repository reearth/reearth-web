import { ReactNode } from "react";

const BuiltinWrapper: React.FC<{ editing?: boolean; children?: ReactNode }> = ({
  editing,
  children,
}) => {
  return <div style={{ pointerEvents: editing ? "none" : "auto" }}>{children}</div>;
};

export default BuiltinWrapper;
