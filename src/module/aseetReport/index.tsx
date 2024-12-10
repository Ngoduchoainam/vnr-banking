"use client";

import { TransactionIcon } from "../../../public/icon/trasaction";
import { MoneyIcon } from "../../../public/icon/money";
import { GoldIcon } from "../../../public/icon/gold";
import { RealEstateIcon } from "../../../public/icon/realEstate";
import { ArrowLeftIcon } from "../../../public/icon/arrowLeft";
import { AssetType } from "@/src/common/type";
import { formatCurrencyVN } from "@/src/utils/buildQueryParams";

const CardAseet = ({
  title,
  quantity,
  type,
  handleClick,
  active,
  isTitle,
}: AssetType) => {
  const RenderIcon = ({ type, active }: { type: number; active: number }) => {
    switch (type) {
      case 0:
        return <TransactionIcon color={active === type ? "#000" : "#fff"} />;
      case 1:
        return <RealEstateIcon color={active === type ? "#000" : "#fff"} />;
      case 2:
        return <GoldIcon color={active === type ? "#000" : "#fff"} />;
      case 3:
        return <MoneyIcon color={active === type ? "#000" : "#fff"} />;
      default:
        break;
    }
  };
  const renderText = (type: number) => {
    switch (type) {
      case 0:
        return;
      case 1:
        return "Tổng tiền";
      case 2:
        return "Tổng";
      case 3:
        return "Tổng số lượng";
      default:
        break;
    }
  };

  const renderUnit = (type: number) => {
    switch (type) {
      case 0:
        return;
      case 1:
        return;
      case 2:
        return "chỉ";
      case 3:
        return "căn";
      default:
        break;
    }
  };
  return (
    <button
      className={`bg-[#48B9FF] p-4 gap-3 rounded-lg w-full flex flex-col items-start text-white min-h-[161px] ${
        active === type && "bg-white !text-black"
      }`}
      onClick={() => handleClick && handleClick(type)}
    >
      <div className="flex justify-between items-center w-full">
        <RenderIcon type={type} active={active} />
        <ArrowLeftIcon color={active === type ? "#000" : "#fff"} />
      </div>
      {!isTitle ? (
        <h2 className="font-semibold text-2xl m-auto">{title}</h2>
      ) : (
        <h2 className="font-semibold text-2xl m-auto">
          <p>Giao dịch</p>
          <p>ngân hàng</p>
        </h2>
      )}

      <p className="font-semibold text-2xl">
        {type !== 0 &&
          (type === 1 ? formatCurrencyVN(`${quantity}`) : quantity)}{" "}
        {renderUnit(type)}
      </p>
      <p className="font-light">{renderText(type)}</p>
    </button>
  );
};

export default CardAseet;
