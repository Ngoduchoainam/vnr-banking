import { ModalDetailType } from "@/src/common/type";
import BaseModal from "@/src/component/config/BaseModal";
import MoneyDetail from "./MoneyDetail";
import GoldTransferDetail from "./GoldDetail";
import RealDetail from "./RealDetail";

const ModalDetail = ({
  isShowDetail = false,
  onCancel,
  dataDetail,
}: ModalDetailType) => {
  return (
    <BaseModal
      open={isShowDetail}
      onCancel={() => {
        onCancel();
      }}
      title="Chi tiết giao dịch"
      offPadding
      className="!w-[900px]"
    >
      {dataDetail?.purposeTrans === "1" && (
        <MoneyDetail dataDetail={dataDetail} onCancel={onCancel} />
      )}

      {dataDetail?.purposeTrans === "2" && (
        <GoldTransferDetail dataDetail={dataDetail} onCancel={onCancel} />
      )}

      {dataDetail?.purposeTrans === "3" && (
        <RealDetail dataDetail={dataDetail} onCancel={onCancel} />
      )}
    </BaseModal>
  );
};

export default ModalDetail;
