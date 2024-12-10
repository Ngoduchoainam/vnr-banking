"use client";

import Header from "@/src/component/Header";
import { Button, Form, Input, Space, Table, Skeleton } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import React, { useContext, useEffect, useState } from "react";
import BaseModal from "@/src/component/config/BaseModal";
import { DataAccountGroup } from "@/src/component/modal/modalAccountGroup";
import {
  addAccountGroup,
  deleteAccountGroup,
  getAccountGroup,
} from "@/src/services/accountGroup";
import { toast } from "react-toastify";
import DeleteModal from "@/src/component/config/modalDelete";
import { RoleContext } from "@/src/component/RoleWapper";

interface FilterGroupAccount {
  Name: string;
  Value: string;
}
type DataTypeWithKey = DataAccountGroup & { key: React.Key };

const PhoneNumber: React.FC = () => {
  const { dataRole } = useContext(RoleContext);

  const keys = dataRole.key;
  const values = `${dataRole.value}`;

  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState<DataAccountGroup | null>(
    null
  );
  const [dataAccountGroup, setDataAccountGroup] = useState<DataAccountGroup[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [, setGlobalTerm] = useState("");
  const [isCreateAccountGroup, setIsCreateAccountGroup] = useState(false);

  const [pageIndex] = useState(1);
  const [pageSize] = useState(50);

  const fetchAccountGroup = async (globalTerm?: string) => {
    const arr: FilterGroupAccount[] = [];
    const addedParams = new Set<string>();
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    setLoading(true);
    try {
      const response = await getAccountGroup(
        pageIndex,
        pageSize,
        globalTerm,
        arr
      );
      const formattedData =
        response?.data?.source?.map((x: DataAccountGroup) => ({
          id: x.id?.toString() || Date.now().toString(),
          fullName: x.fullName,
          notes: x.notes,
        })) || [];
      setDataAccountGroup(formattedData);
    } catch (error) {
      console.error("Error fetching phone numbers:", error);
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreDataAccountGroup = (globalTerm?: string) => {
    const arr: FilterGroupAccount[] = [];
    const addedParams = new Set<string>();
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    if (loading) {
      return;
    }
    setLoading(true);
    getAccountGroup(pageIndex, pageSize, globalTerm, arr)
      .then((res) => res.json())
      .then((body) => {
        setDataAccountGroup([...dataAccountGroup, ...body.results]);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadMoreDataAccountGroup();
  }, []);

  useEffect(() => {
    fetchAccountGroup();
  }, [keys]);

  const handleAddConfirm = async (isCreateAccountGroup: boolean) => {
    try {
      await form.validateFields();
      const formData = form.getFieldsValue();
      setLoading(true);
      setIsCreateAccountGroup(isCreateAccountGroup);

      await addAccountGroup({
        id: formData.id,
        fullName: formData.fullName,
        notes: formData.notes,
      });

      toast.success(
        currentAccount ? "Cập nhật thành công!" : "Thêm mới thành công!"
      );
      setIsAddModalOpen(false);
      await fetchAccountGroup();
      form.resetFields();
      setCurrentAccount(null);
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
      setIsCreateAccountGroup(false);
    }
  };

  const handleEditAccountGroup = (accountGroup: DataAccountGroup) => {
    form.setFieldsValue({
      id: accountGroup.id,
      fullName: accountGroup.fullName,
      notes: accountGroup.notes,
    });
    setCurrentAccount(accountGroup);
    setIsAddModalOpen(true);
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccountGroup, setSelectedAccountGroup] =
    useState<DataAccountGroup | null>(null);

  const handleDeleteAccountGroup = async (x: DataAccountGroup) => {
    setLoading(true);
    try {
      setIsAddModalOpen(false);
      const response = await deleteAccountGroup([x.id]);
      if (response.success === false) {
        toast.error(response.message || "Đã có lỗi xảy ra. Vui lòng thử lại!");
        return;
      }
      toast.success("Xóa thành công!");
      await fetchAccountGroup();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi khi xóa nhóm tài khoản:", error);
      if (error.isAxiosError && error.response) {
        const { status, data } = error.response;
        if (status === 400 && data && data.message) {
          toast.error(data.message || "Đã có lỗi xảy ra. Vui lòng thử lại!");
        } else {
          toast.error(data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!");
        }
      } else {
        toast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (accountGroup: DataAccountGroup) => {
    setSelectedAccountGroup(accountGroup);
    setIsDeleteModalOpen(true);
  };

  const handleCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedAccountGroup(null);
  };

  const handleConfirmDelete = () => {
    if (selectedAccountGroup) {
      handleDeleteAccountGroup(selectedAccountGroup);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSearch = async (value: string) => {
    setGlobalTerm(value);
    await fetchAccountGroup(value);
  };

  const columns = [
    { title: "id", dataIndex: "id", key: "id", hidden: true },
    { title: "Tên nhóm tài khoản", dataIndex: "fullName", key: "fullName" },
    { title: "Ghi chú", dataIndex: "notes", key: "notes" },
    {
      title: "Chức năng",
      key: "action",
      render: (record: DataAccountGroup) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditAccountGroup(record)}
          >
            Chỉnh sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => handleDeleteClick(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const dataSource = dataAccountGroup.map((item) => ({
    ...item,
    key: item.id,
  }));

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeletes = async () => {
    setLoading(true);
    try {
      const idsToDelete = selectedRowKeys.map((key) => Number(key));
      const response = await deleteAccountGroup(idsToDelete);

      if (!response.success || response.code !== 200) {
        throw new Error(response.message || "Xóa không thành công");
      }

      toast.success("Xóa các mục thành công!");
      await fetchAccountGroup();
      setSelectedRowKeys([]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Lỗi khi xóa nhóm tài khoản:", error);
      if (error.isAxiosError && error.response) {
        const { status, data } = error.response;
        if (status === 400 && data && data.message) {
          toast.error(data.message || "Đã có lỗi xảy ra. Vui lòng thử lại!");
        } else {
          toast.error(data?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!");
        }
      } else {
        toast.error(error.message || "Đã có lỗi xảy ra. Vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeletes = () => {
    handleDeletes();
    setIsModalVisible(false);
  };

  const handleDeleteConfirmation = () => {
    setIsModalVisible(true);
  };

  const [checkFilter, setCheckFilter] = useState(false);
  useEffect(() => {
    fetchAccountGroup();
  }, [checkFilter]);

  return (
    <>
      <Header />
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">
          Danh sách nhóm tài khoản
        </div>
        <div className="flex justify-between items-center mb-7">
          <Input
            placeholder="Tìm kiếm tên nhóm tài khoản ..."
            style={{
              width: 253,
              borderRadius: 10,
              height: 38,
              marginRight: 15,
            }}
            onChange={(e) => {
              const value = e.target.value;
              setGlobalTerm(value);
              if (!value) {
                setCheckFilter(!checkFilter);
              }
            }}
            onPressEnter={(e) => handleSearch(e.currentTarget.value)}
          />
          <div className="flex">
            {selectedRowKeys.length > 0 && (
              <Button
                className="bg-[#4B5CB8] w-[136px] !h-10 text-white font-medium hover:bg-[#3A4A9D]"
                onClick={handleDeleteConfirmation}
              >
                Xóa nhiều
              </Button>
            )}
            <div className="w-2" />
            <Button
              className="bg-[#4B5CB8] w-[136px] !h-10 text-white font-medium hover:bg-[#3A4A9D]"
              onClick={() => {
                setCurrentAccount(null);
                form.resetFields();
                setIsAddModalOpen(true);
              }}
            >
              Thêm mới
            </Button>
          </div>
        </div>
        {loading ? (
          <Table
            rowKey="key"
            pagination={false}
            loading={loading}
            dataSource={
              [...Array(13)].map((_, index) => ({
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
          <Table
            rowKey="key"
            dataSource={dataSource}
            columns={columns}
            rowSelection={rowSelection}
            loading={loading}
          />
        )}
      </div>
      <BaseModal
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        title={
          currentAccount
            ? "Chỉnh sửa nhóm tài khoản"
            : "Thêm mới nhóm tài khoản"
        }
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          className="flex flex-col gap-1 w-full"
        >
          <Form.Item hidden label="id" name="id">
            <Input hidden autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="Tên nhóm tài khoản"
            name="fullName"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhóm tài khoản!" },
            ]}
          >
            <Input placeholder="Nhập nhóm tài khoản" autoComplete="off" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={4} placeholder="Nhập ghi chú" />
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
              onClick={() => handleAddConfirm(true)}
              className={`${
                isCreateAccountGroup && "pointer-events-none"
              } bg-[#4B5CB8] border text-white font-medium w-[189px] !h-10`}
              loading={isCreateAccountGroup}
            >
              {currentAccount ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </BaseModal>
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
        selectedAccountGroup={selectedAccountGroup}
      />
      <DeleteModal
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onConfirm={handleConfirmDeletes}
        handleDeleteTele={async () => {
          await handleDeletes();
          setIsModalVisible(false);
        }}
      />
    </>
  );
};

export default PhoneNumber;
