"use client";

import React, { useContext, useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Header from "@/src/component/Header";
import { Button, Form, Input, Select, Skeleton, Space, Table } from "antd";
import BaseModal from "@/src/component/config/BaseModal";
import { toast } from "react-toastify"; // Import toast
import DeleteModal from "@/src/component/config/modalDelete";
import {
  addGroupBranch,
  deleteGroupBranch,
  getBranchSystem,
} from "@/src/services/branchSystem";
import { getGroupSystem } from "@/src/services/groupSystem";
import { RoleContext } from "@/src/component/RoleWapper";

export interface DataBranchModal {
  id: number;
  name: string;
  note: string;
  groupSystemId: number;
  groupSystemName: string;
}

interface FilterRole {
  Name: string;
  Value: string;
}

type DataTypeWithKey = DataBranchModal & { key: React.Key };

const GroupBranchPage = () => {
  const { dataRole } = useContext(RoleContext);
  const keys = dataRole.key;
  const values = `${dataRole.value}`;
  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentBranch, setCurrentBranch] = useState<DataBranchModal | null>(
    null
  );
  const [dataBranch, setDataBranch] = useState<DataBranchModal[]>([]);
  const [, setGlobalTerm] = useState("");
  const pageIndex = 1;
  const pageSize = 20;

  const [groupSystem, setGroupSystem] = useState<Array<DataBranchModal>>([]);
  // const [systemId, setSystemId] = useState<number>(0);
  const [isAddGroupBranch, setIsAddGroupBranch] = useState<boolean>(false);

  const fetchGroupSystem = async (globalTerm?: string) => {
    const arrRole: FilterRole[] = [];
    const addedParams = new Set<string>();
    arrRole.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    try {
      const response = await getBranchSystem(
        pageIndex,
        pageSize,
        globalTerm,
        arrRole
      );
      const formattedData =
        response?.data?.source?.map((x: DataBranchModal) => ({
          id: x.id,
          name: x.name,
          note: x.note,
          groupSystemId: x.groupSystemId,
          groupSystemName: x.groupSystemName,
        })) || [];
      setDataBranch(formattedData);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupSystem();
  }, [keys]);

  const handleAddConfirm = async (isAddGroupBranch: boolean) => {
    try {
      await form.validateFields();
      setIsAddGroupBranch(isAddGroupBranch);
      const formData = form.getFieldsValue();
      setLoading(true);
      const response = await addGroupBranch({
        id: formData.id,
        name: formData.name,
        note: formData.note,
        groupSystemId: formData.groupSystemId,
        groupSystemName: formData.groupSystemName,
      });
      if (response && response.success === false) {
        toast.error(response.message || "Có lỗi xảy ra, vui lòng thử lại!");
        setLoading(false);
        return;
      }
      setIsAddModalOpen(false);
      form.resetFields();
      setCurrentBranch(null);
      toast.success(
        currentBranch ? "Cập nhật thành công!" : "Thêm mới thành công!"
      );
      await fetchGroupSystem();
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Lỗi:", error);
      if (typeof error === "object" && error !== null && "response" in error) {
        const responseError = error as {
          response: { data?: { message?: string } };
        };

        if (responseError.response && responseError.response.data) {
          const { message } = responseError.response.data;
          toast.error(message || "Có lỗi xảy ra, vui lòng thử lại!");
        } else {
          toast.error("Có lỗi xảy ra, vui lòng thử lại!");
        }
      } else {
        toast.error("Có lỗi xảy ra, vui lòng thử lại!");
      }
    } finally {
      setIsAddGroupBranch(false);
    }
  };

  const handleEditTele = (x: DataBranchModal) => {
    setCurrentBranch(x);
    form.setFieldsValue({
      id: x.id,
      name: x.name,
      note: x.note,
      groupSystemId: x.groupSystemId,
      groupSystemName: x.groupSystemName,
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteTele = async (x: DataBranchModal) => {
    setLoading(true);
    try {
      setIsAddModalOpen(false);
      await deleteGroupBranch([x.id]);
      toast.success("Xóa nhóm chi nhánh thành công!");
      await fetchGroupSystem();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error("Có lỗi xảy ra khi xóa!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setGlobalTerm(value);
    try {
      if (value.trim() === "") {
        const data = await getBranchSystem(1, 20);
        const formattedData =
          data?.data?.source?.map((x: DataBranchModal) => ({
            id: x.id,
            name: x.name,
            note: x.note,
            groupSystemId: x.groupSystemId,
            groupSystemName: x.groupSystemName,
          })) || [];

        setDataBranch(formattedData);
      } else {
        const data = await getBranchSystem(1, 20, value);
        const formattedData =
          data?.data?.source?.map((x: DataBranchModal) => ({
            id: x.id,
            name: x.name,
            note: x.note,
            groupSystemId: x.groupSystemId,
            groupSystemName: x.groupSystemName,
          })) || [];

        setDataBranch(formattedData);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm tài:", error);
      toast.error("Có lỗi xảy ra khi tìm kiếm!");
    }
  };

  const getGroupSystems = async () => {
    try {
      const getSystem = await getGroupSystem(1, 20);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = getSystem?.data?.source?.map((x: any) => ({
        value: x.id,
        label: x.name || "Không xác định",
        groupSystemId: x.id,
      }));
      setGroupSystem(res);
    } catch (error) {
      console.error(error);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccountGroup, setSelectedAccountGroup] =
    useState<DataBranchModal | null>(null);

  const handleDeleteClick = (tele: DataBranchModal) => {
    setSelectedAccountGroup(tele);
    setIsDeleteModalOpen(true);
  };

  const handleCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedAccountGroup(null);
  };

  const handleConfirmDelete = () => {
    if (selectedAccountGroup) {
      handleDeleteTele(selectedAccountGroup);
      setIsDeleteModalOpen(false);
    }
  };

  const columns = [
    { title: "id", dataIndex: "id", key: "id", hidden: true },
    { title: "Tên chi nhánh", dataIndex: "name", key: "name" },
    {
      title: "Thuộc hệ thống",
      dataIndex: "groupSystemName",
      key: "groupSystemName",
    },
    { title: "Ghi chú", dataIndex: "note", key: "note" },
    {
      title: "Id hệ thống",
      dataIndex: "groupSystemId",
      key: "groupSystemId",
      hidden: true,
    },
    {
      title: "Chức năng",
      key: "action",
      render: (record: DataBranchModal) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditTele(record)}
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

  const dataSource = dataBranch.map((item) => ({
    ...item,
    key: item.id,
  }));

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeletes = async () => {
    setLoading(true);
    try {
      const idsToDelete = selectedRowKeys.map((key) => Number(key));
      await deleteGroupBranch(idsToDelete);
      toast.success("Xóa các mục thành công!");
      await fetchGroupSystem();
      setSelectedRowKeys([]);
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error("Có lỗi xảy ra khi xóa!");
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
    fetchGroupSystem();
  }, [checkFilter]);

  return (
    <>
      <Header />
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">Danh sách chi nhánh</div>
        <div className="flex justify-between items-center mb-7">
          <Input
            placeholder="Tìm kiếm chi nhánh ..."
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
            onPressEnter={async (e) => {
              handleSearch(e.currentTarget.value);
            }}
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
                setCurrentBranch(null);
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
            columns={columns}
            rowSelection={rowSelection}
            loading={loading}
            dataSource={dataSource}
          />
        )}
      </div>
      <BaseModal
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        title={currentBranch ? "Chỉnh sửa chi nhánh" : "Thêm mới chi nhánh"}
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
            label="Tên chi nhánh"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên chi nhánh!" },
            ]}
          >
            <Input placeholder="Tên nhóm chi nhánh" autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="Hệ thống"
            name="groupSystemName"
            rules={[{ required: true, message: "Vui lòng chọn hệ thống!" }]}
          >
            <Select
              placeholder="Chọn hệ thống"
              onFocus={getGroupSystems}
              options={groupSystem}
              // value={systemId}
              allowClear
              // onChange={(value) => {
              //   setSystemId(value);
              //   // getBranchSystems();
              // }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={async (value: any) => {
                const selectedGroup = await groupSystem.find(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (item: any) => item.value === value
                );
                if (selectedGroup) {
                  form.setFieldsValue({
                    groupSystemId: selectedGroup.groupSystemId,
                  });
                }
              }}
            />
          </Form.Item>
          <Form.Item hidden label="Hệ thống" name="groupSystemId">
            <Select />
          </Form.Item>
          <Form.Item label="Ghi chú" name="note">
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
                isAddGroupBranch && "pointer-events-none"
              } bg-[#4B5CB8] border text-white font-medium w-[189px] !h-10`}
              loading={isAddGroupBranch}
            >
              {currentBranch ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </BaseModal>
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
        handleDeleteTele={selectedAccountGroup}
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

export default GroupBranchPage;
