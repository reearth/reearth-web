import React from "react";

import { styled } from "@reearth/theme";

export type Props = {
  className?: string;
  alias?: string;
};

export default function Component({ className, alias }: Props): JSX.Element | null {
  return <Error className={className}>This project ({alias}) is not found</Error>;
}

const Error = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #000;
  color: #ccc;
  padding: 20px;
  font-size: 14px;
`;
