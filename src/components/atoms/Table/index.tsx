import { fonts, styled } from "@reearth/theme";
import React from "react";

export type Props<T extends {}> = {
  className?: string;
  headers: (keyof T)[];
  items: T[];
  bg: string;
  borderColor: string;
  width?: string;
  height?: string;
  scrollX?: boolean;
  scrollY?: boolean;
};

const Table = <T extends {}>({
  className,
  headers,
  items,
  bg,
  borderColor,
}: // width,
// height,
// scrollX,
// scrollY,
Props<T>): ReturnType<React.FC<Props<T>>> => {
  return (
    <StyledTable bg={bg} borderColor={borderColor} className={className}>
      <thead>
        <tr>
          {headers.map((h, i) => (
            <StyledTh key={i}>{h}</StyledTh>
          ))}
        </tr>
      </thead>
      <tbody>
        {items.map((item, i) => {
          console.log(item);
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

const StyledTable = styled.table<{ bg?: string; borderColor?: string }>`
  table-layout: auto;
  text-align: left;
  background: ${({ bg, theme }) => (bg ? bg : theme.main.bg)};
  border-color: ${({ borderColor, theme }) => (borderColor ? borderColor : theme.main.lighterBg)};
  text-overflow: ellipsis;
`;

const StyledTh = styled.th`
  padding: ${({ theme }) => theme.metrics.s}px;
  font-weight: ${fonts.weight.normal};
`;

const StyledTd = styled.td`
  padding: ${({ theme }) => theme.metrics.s}px;
`;

export default Table;
