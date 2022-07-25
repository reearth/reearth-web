import { ReactNode, CSSProperties, AriaRole } from "react";

export type Props = {
  className?: string;
  onClick?: () => void;
  children?: ReactNode;
  testId?: string;
  role?: AriaRole;
  hidden?: boolean;
} & FlexOptions;

export type FlexOptions = {
  align?: CSSProperties["alignItems"];
  justify?: CSSProperties["justifyContent"];
  wrap?: CSSProperties["flexWrap"];
  direction?: CSSProperties["flexDirection"];
  basis?: CSSProperties["flexBasis"];
  grow?: CSSProperties["flexGrow"];
  shrink?: CSSProperties["flexShrink"];
  flex?: CSSProperties["flex"];
  gap?: CSSProperties["gap"];
};

const Flex: React.FC<Props> = ({
  className,
  onClick,
  children,
  testId,
  align,
  justify,
  wrap,
  direction,
  basis,
  grow,
  shrink,
  flex,
  gap,
  role,
  hidden,
}) => {
  return (
    <div
      className={className}
      role={role}
      style={{
        display: "flex",
        flexDirection: direction,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap,
        flexBasis: basis,
        flexGrow: grow,
        flexShrink: shrink,
        flex,
        gap, // TODO: Safari doesn't support this property and please develop polyfill
      }}
      onClick={onClick}
      data-testid={testId}
      aria-hidden={!hidden}>
      {children}
    </div>
  );
};

export default Flex;
