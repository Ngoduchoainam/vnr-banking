import React from "react";
import { Button, Modal } from "antd";
import { DataAccountGroup } from "@/src/component/modal/modalAccountGroup";
import Delete from "../../../public/img/delete.png";
import Image from "next/image";
// import { BankAccounts } from "../modal/modalBankAccount";

interface DeleteModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  selectedAccountGroup?: DataAccountGroup | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectedAccount?: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleDeletePhoneNumber?: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleDeleteTele?: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleDeleteTeleIntergration?: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleDeleteSheet?: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleDeleteSheetIntergration?: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transaction?: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  role?: any | null;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={
        <div className="flex justify-center">
          <Button onClick={onCancel} className="w-[180px] h-[44px] mr-2">
            Quay lại
          </Button>
          <Button
            type="primary"
            onClick={onConfirm}
            className="w-[180px] h-[44px] bg-red-600 border-red-600 text-white"
          >
            Xác nhận
          </Button>
        </div>
      }
    >
      <div className="flex justify-center flex-col items-center">
        <Image src={Delete} alt="Delete" width={73} height={73} />
        <div className="text-xl font-bold text-[#DB0606] py-3">
          Xác nhận xóa
        </div>
        <p className="flex justify-center items-center">
          Bạn có chắc chắn chấp nhận điều này không?
        </p>
      </div>
    </Modal>
  );
};

export default DeleteModal;
