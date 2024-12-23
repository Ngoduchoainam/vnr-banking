"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Header from "@/src/component/Header";
import { Button, Form, Input, Space, Spin } from "antd";
import BaseModal from "@/src/component/config/BaseModal";
import { toast } from "react-toastify"; // Import toast
import DeleteModal from "@/src/component/config/modalDelete";
import {
  addGroupSystem,
  deleteGroupSystem,
  getGroupSystem,
} from "@/src/services/groupSystem";
import { RoleContext } from "@/src/component/RoleWapper";
import LoadingTable from "@/src/component/LoadingTable";

export interface DataSystemModal {
  id: number;
  name: string;
  note: string;
}

interface FilterRole {
  Name: string;
  Value: string;
}

const GroupSystemPage = () => {
  const { dataRole } = useContext(RoleContext);
  const keys = dataRole.key;
  const values = `${dataRole.value}`;

  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentSystem, setCurrentSystem] = useState<DataSystemModal | null>(
    null
  );
  const [dataSystem, setDataSystem] = useState<DataSystemModal[]>([]);
  const [globalTerm, setGlobalTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(20);
  const [totalRecord, setTotalRecord] = useState(100);

  const [isAddGroupSystem, setIsAddGroupSystem] = useState<boolean>(false);

  const isFetchingRef = useRef(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleScroll = () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollPosition >= documentHeight && !isFetchingRef.current) {
      isFetchingRef.current = true;
      setPageIndex((prev) => prev + 1);
    }
  };

  useEffect(() => {
    if (pageIndex > 1 && dataSystem.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;

      fetchGroupSystem(globalTerm).finally(() => {
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

  const fetchGroupSystem = async (globalTerm?: string) => {
    const arrRole: FilterRole[] = [];
    const addedParams = new Set<string>();
    arrRole.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    if (pageIndex > 1) {
      setIsLoading(true)
    }
    try {
      const response = await getGroupSystem(pageIndex, pageSize, globalTerm, arrRole);
      const formattedData =
        response?.data?.source?.map((x: DataSystemModal) => ({
          id: x.id,
          name: x.name,
          note: x.note,
        })) || [];

      setTotalRecord(response?.data?.totalRecords || 0);

      setDataSystem((prevData) => [...prevData, ...formattedData]);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
      setIsLoading(false)
    }
  };

  const handleAddConfirm = async (isAddGroupSystem: boolean) => {
    try {
      await form.validateFields();
      setLoading(true);
      setIsAddGroupSystem(isAddGroupSystem);
      const formData = form.getFieldsValue();

      setLoading(true);
      const response = await addGroupSystem({
        id: formData.id,
        name: formData.name,
        note: formData.note,
      });
      if (response && response.success === false) {
        toast.error(response.message || "Có lỗi xảy ra, vui lòng thử lại!");
        setLoading(false);
        return;
      }
      setIsAddModalOpen(false);
      form.resetFields();
      setCurrentSystem(null);
      setIsAddModalOpen(false);
      toast.success(
        currentSystem ? "Cập nhật thành công!" : "Thêm mới thành công!"
      );

      await setPageIndex(1);;
      await setDataSystem([])

      fetchGroupSystem();
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
      setIsAddGroupSystem(false);
    }
  };

  const handleEditTele = (x: DataSystemModal) => {
    setCurrentSystem(x);
    form.setFieldsValue({
      id: x.id,
      name: x.name,
      note: x.note,
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteTele = async (x: DataSystemModal) => {
    setLoading(true);
    try {
      setIsAddModalOpen(false);
      await deleteGroupSystem([x.id]);
      toast.success("Xóa nhóm hệ thống thành công!");
      await setPageIndex(1);;
      await setDataSystem([])
      fetchGroupSystem();
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error("Có lỗi xảy ra khi xóa!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    console.log(195, value)
    setGlobalTerm(value);
    try {
      if (value.trim() === "") {
        const data = await getGroupSystem(1, 20);
        const formattedData =
          data?.data?.source?.map((x: DataSystemModal) => ({
            id: x.id,
            name: x.name,
            note: x.note,
          })) || [];

        setDataSystem(formattedData);
      } else {
        const data = await getGroupSystem(1, 20, value);
        const formattedData =
          data?.data?.source?.map((x: DataSystemModal) => ({
            id: x.id,
            name: x.name,
            note: x.note,
          })) || [];

        setDataSystem(formattedData);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm tài khoản ngân hàng:", error);
      toast.error("Có lỗi xảy ra khi tìm kiếm!");
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccountGroup, setSelectedAccountGroup] =
    useState<DataSystemModal | null>(null);

  const handleDeleteClick = (x: DataSystemModal) => {
    setSelectedAccountGroup(x);
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
    { title: "Tên hệ thống", dataIndex: "name", key: "name" },
    { title: "Ghi chú", dataIndex: "note", key: "note" },
    {
      title: "Chức năng",
      key: "action",
      render: (record: DataSystemModal) => (
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

  const dataSource = dataSystem.map((item) => ({
    ...item,
    key: item.id,
  }));

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeletes = async () => {
    setLoading(true);
    try {
      const idsToDelete = selectedRowKeys.map((key) => Number(key));
      await deleteGroupSystem(idsToDelete);
      toast.success("Xóa các mục thành công!");
      await setPageIndex(1);;
      await setDataSystem([])
      fetchGroupSystem();
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
  }, [checkFilter, keys]);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <Spin size="large" />
        </div>
      )}
      <Header />
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">Danh sách hệ thống</div>
        <div className="flex justify-between items-center mb-7">
          <Input
            placeholder="Tìm kiếm hệ thống ..."
            style={{
              width: 253,
              marginRight: 15,
            }}
            onChange={async (e) => {
              const value = e.target.value;
              setGlobalTerm(value);
              if (!value) {
                await setPageIndex(1);;
                await setDataSystem([])
                setCheckFilter(!checkFilter);
              }
            }}
            onPressEnter={async (e) => {
              await setPageIndex(1);
              await setDataSystem([]);

              handleSearch((e.target as HTMLInputElement).value);
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
                setCurrentSystem(null);
                form.resetFields();
                setIsAddModalOpen(true);
              }}
            >
              Thêm mới
            </Button>
          </div>
        </div>
        <LoadingTable
          loading={loading}
          pageIndex={pageIndex}
          dataSource={dataSource}
          columns={columns}
        />
      </div>
      <BaseModal
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        title={currentSystem ? "Chỉnh sửa hệ thống" : "Thêm mới hệ thống"}
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
            label="Tên hệ thống"
            name="name"
            rules={[{ required: true, message: "Vui lòng nhập tên hệ thống!" }]}
          >
            <Input placeholder="Tên nhóm hệ thống" autoComplete="off" />
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
              className={`${isAddGroupSystem && "pointer-events-none"
                } bg-[#4B5CB8] border text-white font-medium w-[189px] !h-10`}
              loading={isAddGroupSystem}
            >
              {currentSystem ? "Cập nhật" : "Thêm mới"}
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

export default GroupSystemPage;
