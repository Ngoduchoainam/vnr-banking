import { Modal } from "antd";
import React, { useEffect, useState } from "react";

export interface BaseModalProps {
  open: boolean;
  onCancel: () => void;
  onOk?: (e: React.MouseEvent<HTMLElement>) => void;
  title?: string;
  children?: React.ReactNode;
  width?: number;
  key?: unknown;
  className?: string;
  centered?: boolean;
  offPadding?: boolean;
  maskClosable?: boolean;
}

function BaseModal({
  open,
  onCancel,
  onOk,
  children,
  title,
  width,
  className,
  centered,
  offPadding,
  maskClosable = false,
}: BaseModalProps) {
  const [keyModal, setKeyModal] = useState<number>(Date.now());

  useEffect(() => {
    if (open) {
      setKeyModal(Date.now());
    }
  }, [open]);

  return (
    <Modal
      style={{ padding: 0 }}
      centered={centered}
      key={keyModal}
      destroyOnClose
      className={`rounded-lg ${className}`}
      onCancel={onCancel}
      footer={<div />}
      open={open}
      onOk={onOk}
      width={width ?? 848}
      maskClosable={maskClosable}
    >
      <div
        className={`${
          offPadding ? "" : "px-6 py-5"
        } w-full relative rounded-lg`}
      >
        <div
          className={`w-full ${offPadding ? "" : "px-2 rounded-lg"} flex flex-col items-center`}
        >
          {title && (
            <div className="text-[26px] font-bold my-4 w-full">
              <p>{title}</p>
            </div>
          )}
          {children}
        </div>
      </div>
    </Modal>
  );
}

export default BaseModal;
