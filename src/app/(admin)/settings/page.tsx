"use client";

import React, { useEffect, useRef, useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space, Spin } from "antd";
import { editSettings, getSettings } from "@/src/services/settings";
import BaseModal from "@/src/component/config/BaseModal";
import LoadingTable from "@/src/component/LoadingTable";

export interface SettingsModal {
  id: number;
  name: string;
  stringValue: string;
  description: string;
}

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [dataSettings, setDataSettings] = useState<SettingsModal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingRecord, setEditingRecord] = useState<SettingsModal | null>(
    null
  );
  const [pageIndex, setPageIndex] = useState(1);
  const [totalRecord, setTotalRecord] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const isFetchingRef = useRef(false);

  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= documentHeight && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setPageIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (pageIndex > 1 && dataSettings.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;

      genSettings().finally(() => {
        setTimeout(() => {

          window.scrollTo(0, scrollPositionBeforeFetch + scrollPositionBeforeFetch / 10);
          isFetchingRef.current = false;
        }, 0);
      });
    }
  }, [pageIndex]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const genSettings = async () => {
    if (pageIndex > 1) {
      setIsLoading(true)
    }
    try {
      const response = await getSettings();
      const formattedData =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response?.data?.source?.map((item: any) => ({
          id: item.id?.toString() || Date.now().toString(),
          name: item.name,
          stringValue: item.stringValue,
          description: item.description,
        })) || [];
      setTotalRecord(response?.data?.totalRecords || 0);
      setDataSettings((prevData) => [...prevData, ...formattedData]);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
      setIsLoading(false)
    }
  };

  useEffect(() => {
    genSettings();
  }, []);

  const handleEditConfirm = async () => {
    // const formData = form.getFieldsValue();
    setLoading(true);
    try {
      await form.validateFields();
      setIsAddModalOpen(false);
      const formData = form.getFieldsValue();
      await editSettings({
        id: formData.id,
        name: formData.name,
        stringValue: formData.stringValue,
        description: formData.description,
      });

      setIsAddModalOpen(false);
      setLoading(false);
      await setPageIndex(1);
      await setDataSettings([])
      genSettings();
    } catch (error) {
      console.error("Lỗi:", error);
      setLoading(false);
    }
  };

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", hidden: true },
    { title: "Tên loại cấu hình", dataIndex: "name", key: "name" },
    { title: "Giá trị", dataIndex: "stringValue", key: "stringValue" },
    { title: "Ghi chú", dataIndex: "description", key: "description" },
    {
      title: "Chức năng",
      key: "action",
      render: (record: SettingsModal) => (
        <Space size="middle">
          <Button
            onClick={() => {
              form.setFieldsValue(record); // Đặt giá trị của form từ record
              setEditingRecord(record); // Lưu record đang chỉnh sửa
              setIsAddModalOpen(true);
            }}
            icon={<EditOutlined />}
          >
            Chỉnh sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <Spin size="large" />
        </div>
      )}
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">
          Danh sách cấu hình trang tính
        </div>
        <LoadingTable
          loading={loading}
          pageIndex={pageIndex}
          dataSource={dataSettings}
          columns={columns}
        />
      </div>
      <BaseModal
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        title={"Chỉnh sửa cấu hình hệ thống"}
      >
        <Form
          form={form}
          layout="vertical"
          className="flex flex-col gap-1 w-full"
        >
          <Form.Item hidden label="id" name="id">
            <Input hidden autoComplete="off" />
          </Form.Item>
          <Form.Item label="Tên thuộc tính" name="name">
            <Input disabled placeholder="Tên thuộc tính" autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="Giá trị"
            name="stringValue"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập giá trị!",
              },
            ]}
          >
            <Input placeholder="Vui lòng nhập giá trị" autoComplete="off" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="description">
            <Input.TextArea disabled rows={4} placeholder="Nhập ghi chú" />
          </Form.Item>
          <div className="flex justify-end">
            <Button
              onClick={() => setIsAddModalOpen(false)}
              className="w-[189px] !h-10"
            >
              Đóng
            </Button>
            <div className="w-5" />
            <Button
              type="primary"
              onClick={handleEditConfirm}
              className="bg-[#4B5CB8] border text-white font-medium w-[189px] !h-10"
            >
              Lưu
            </Button>
          </div>
        </Form>
      </BaseModal>
    </>
  );
};

export default Settings;
