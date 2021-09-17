import { fonts, styled } from "@reearth/theme";
import React from "react";

export type Props<T extends {}> = {
  className?: string;
  headers: (keyof T)[];
  items: T[];
  bg?: string;
  borderColor?: string;
  layout?: "auto" | "fixed";
  textAlign?: "left" | "center" | "right";
  width?: string;
  columnWidth?: string;
  columnHeight?: string;
  scroll?: boolean;
  multiLine?: boolean;
};

const Table = <T extends {}>({
  className,
  width,
  headers,
  items,
  bg,
  borderColor,
  layout = "auto",
  textAlign = "left",
  columnWidth,
  columnHeight,
  scroll = true,
  multiLine = false,
}: Props<T>): ReturnType<React.FC<Props<T>>> => {
  return (
    <StyledTable
      bg={bg}
      borderColor={borderColor}
      layout={layout}
      className={className}
      textAlign={textAlign}
      multiLine={multiLine}
      width={width}
      columnWidth={columnWidth}
      columnHeight={columnHeight}
      scroll={scroll}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <StyledTh key={i} width={columnWidth}>
              {h}
            </StyledTh>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          return (
            <tr key={i}>
              {headers.map((h, i) => {
                return <StyledTd key={i}>{item[h]}</StyledTd>;
              })}
            </tr>
          );
        })}
      </tbody>
    </StyledTable>
  );
};

const StyledTable = styled.table<{
  bg?: string;
  borderColor?: string;
  layout?: "auto" | "fixed";
  textAlign?: "left" | "center" | "right";
  multiLine?: boolean;
  columnWidth?: string;
  columnHeight?: string;
  scroll?: boolean;
  width?: string;
}>`
  table-layout: ${({ layout }) => layout};
  text-align: ${({ textAlign }) => textAlign};
  white-space: ${({ multiLine }) => (multiLine ? "normal" : "nowrap")};
  background: ${({ bg, theme }) => (bg ? bg : theme.main.bg)};
  border-color: ${({ borderColor, theme }) => (borderColor ? borderColor : theme.main.lighterBg)};
  width: ${({ width }) => (width ? width : "100%")};
  height: ${({ columnHeight }) => columnHeight};
  overflow: ${({ scroll }) => (scroll ? "scroll" : "hidden")};
  display: block;
`;

const StyledTh = styled.th<{ width?: string }>`
  padding: ${({ theme }) => theme.metrics.s}px;
  font-weight: ${fonts.weight.normal};
  width: ${({ width }) => width};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledTd = styled.td`
  padding: ${({ theme }) => theme.metrics.s}px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export default Table;
