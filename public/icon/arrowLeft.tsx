import { Transaction1Props } from "@/src/common/type";
import React from "react";

export const ArrowLeftIcon: React.FC<Transaction1Props> = ({
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
        d="M12.0002 3.84003C16.5122 3.84003 20.1602 7.48803 20.1602 12C20.1602 16.512 16.5122 20.16 12.0002 20.16C7.48816 20.16 3.84016 16.512 3.84016 12C3.84016 7.48803 7.48816 3.84003 12.0002 3.84003ZM12.0002 19.2C15.9842 19.2 19.2002 15.984 19.2002 12C19.2002 8.01603 15.9842 4.80003 12.0002 4.80003C8.01616 4.80003 4.80016 8.01603 4.80016 12C4.80016 15.984 8.01616 19.2 12.0002 19.2Z"
        fill={color}
      />
      <path
        d="M11.8557 7.34401L16.5117 12L11.8557 16.656L11.1837 15.984L15.1677 12L11.1837 8.01601L11.8557 7.34401Z"
        fill={color}
      />
      <path
        d="M15.8398 12.48L7.67984 12.48L7.67984 11.52L15.8398 11.52L15.8398 12.48Z"
        fill={color}
      />
    </svg>
  );
};
