import { Transaction1Props } from "@/src/common/type";
import React from "react";

export const GoldIcon: React.FC<Transaction1Props> = ({
  className = "",
  color = "#fff",
  ...props
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <path
        d="M1 22L2.5 17H9.5L11 22H1ZM13 22L14.5 17H21.5L23 22H13ZM6 15L7.5 9.99997H14.5L16 15H6ZM23 6.04998L19.14 7.13997L18.05 11L16.96 7.13997L13.1 6.04998L16.96 4.95998L18.05 1.09998L19.14 4.95998L23 6.04998Z"
        fill={color}
      />
    </svg>
  );
};
