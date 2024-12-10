"use client";

import React, { useEffect, useState } from "react";
import { EditOutlined } from "@ant-design/icons";
import Header from "@/src/component/Header";
import { Button, Form, Input, Skeleton, Space, Table } from "antd";
import { editSettings, getSettings } from "@/src/services/settings";
import BaseModal from "@/src/component/config/BaseModal";

export interface SettingsModal {
  id: number;
  name: string;
  stringValue: string;
  description: string;
}

type DataTypeWithKey = SettingsModal & { key: React.Key };

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [dataSettings, setDataSettings] = useState<SettingsModal[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [editingRecord, setEditingRecord] = useState<SettingsModal | null>(
    null
  );

  const genSettings = async () => {
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
      setDataSettings(formattedData);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
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
      await genSettings();
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
      <Header />
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">
          Danh sách cấu hình trang tính
        </div>
        {loading ? (
          <Table
            rowKey="key"
            pagination={false}
            loading={loading}
            dataSource={
              [...Array(15)].map((_, index) => ({
                key: `key${index}`,
              })) as DataTypeWithKey[]
            }
            columns={columns.map((column) => ({
              ...column,
              render: function renderPlaceholder() {
                return (
                  <Skeleton
                    key={column.key as React.Key}
                    title
                    active={false}
                    paragraph={false}
                  />
                );
              },
            }))}
          />
        ) : (
          <Table dataSource={dataSettings} columns={columns} />
        )}
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
