import React from "react";

const CardDetail: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ul className="bg-white card-custom py-[18px] px-6 flex flex-col gap-6 w-full">
      {children}
    </ul>
  );
};

export default CardDetail;
