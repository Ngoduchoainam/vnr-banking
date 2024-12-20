"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Header from "@/src/component/Header";
import { Button, Form, Input, Space, Spin } from "antd";
import {
  addTelegram,
  deleteTelegram,
  getListTelegram,
} from "@/src/services/telegram";
import BaseModal from "@/src/component/config/BaseModal";
import { toast } from "react-toastify";
import DeleteModal from "@/src/component/config/modalDelete";
import { RoleContext } from "@/src/component/RoleWapper";
import LoadingTable from "@/src/component/LoadingTable";

export interface DataTelegramModal {
  id: number;
  name: string;
  chatId: string;
  notes: string;
}

interface FilterRole {
  Name: string;
  Value: string;
}

const Telegram = () => {
  const { dataRole } = useContext(RoleContext);
  const keys = dataRole.key;
  const values = `${dataRole.value}`;

  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentTelegram, setCurrentTelegram] =
    useState<DataTelegramModal | null>(null);
  const [dataTelegram, setDataTelegram] = useState<DataTelegramModal[]>([]);
  const [, setGlobalTerm] = useState("");
  const [pageSize] = useState(20);

  const [isAddTelegram, setIsAddTelegram] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState(1);
  const [totalRecord, setTotalRecord] = useState(100);

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
    if (pageIndex > 1 && dataTelegram.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;

      fetchTelegram().finally(() => {
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


  const fetchTelegram = async (globalTerm?: string) => {
    const arr: FilterRole[] = [];
    const addedParams = new Set<string>();
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    if (pageIndex > 1) {
      setIsLoading(true)
    }
    try {
      const response = await getListTelegram(
        pageIndex,
        pageSize,
        globalTerm,
        arr
      );
      const formattedData =
        response?.data?.source?.map((x: DataTelegramModal) => ({
          id: x.id?.toString() || Date.now().toString(),
          name: x.name,
          chatId: x.chatId,
          notes: x.notes,
        })) || [];
      setTotalRecord(response?.data?.totalRecords || 0);
      setDataTelegram((prevData) => [...prevData, ...formattedData]);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
      setIsLoading(false)
    }
  };

  const handleAddConfirm = async (isAddTelegram: boolean) => {
    try {
      await form.validateFields();
      setIsAddTelegram(isAddTelegram);
      const formData = form.getFieldsValue();
      setLoading(true);
      const response = await addTelegram({
        id: formData.id,
        name: formData.name,
        chatId: formData.chatId,
        notes: formData.notes,
      });
      if (response && response.success === false) {
        toast.error(response.message || "Có lỗi xảy ra, vui lòng thử lại!");
        setLoading(false);
        return;
      }
      setIsAddModalOpen(false);
      form.resetFields();
      setCurrentTelegram(null);
      toast.success(
        currentTelegram ? "Cập nhật thành công!" : "Thêm mới thành công!"
      );
      setIsAddModalOpen(false);
      await setPageIndex(1);
      await setDataTelegram([])
      fetchTelegram();
      setLoading(false);
    } catch (error) {
      setLoading(false);
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
      setIsAddTelegram(false);
    }
  };

  const handleEditTele = (x: DataTelegramModal) => {
    setCurrentTelegram(x);
    form.setFieldsValue({
      id: x.id,
      name: x.name,
      chatId: x.chatId,
      notes: x.notes,
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteTele = async (x: DataTelegramModal) => {
    setLoading(true);
    try {
      setIsAddModalOpen(false);
      await deleteTelegram([x.id]);
      toast.success("Xóa nhóm telegram thành công!");
      await setPageIndex(1);
      await setDataTelegram([])
      fetchTelegram();
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản ngân hàng:", error);
      toast.error("Có lỗi xảy ra khi xóa!");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setGlobalTerm(value);
    try {
      if (value.trim() === "") {
        const data = await getListTelegram(1, 20);
        const formattedData =
          data?.data?.source?.map((x: DataTelegramModal) => ({
            id: x.id,
            name: x.name,
            chatId: x.chatId,
            notes: x.notes,
          })) || [];

        setDataTelegram(formattedData);
      } else {
        const data = await getListTelegram(1, 20, value);
        const formattedData =
          data?.data?.source?.map((x: DataTelegramModal) => ({
            id: x.id,
            name: x.name,
            chatId: x.chatId,
            notes: x.notes,
          })) || [];

        setDataTelegram(formattedData);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm tài khoản ngân hàng:", error);
      toast.error("Có lỗi xảy ra khi tìm kiếm!");
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccountGroup, setSelectedAccountGroup] =
    useState<DataTelegramModal | null>(null);

  const handleDeleteClick = (tele: DataTelegramModal) => {
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
    { title: "Tên nhóm telegram", dataIndex: "name", key: "name" },
    { title: "Id nhóm telegram", dataIndex: "chatId", key: "chatId" },
    { title: "Ghi chú", dataIndex: "notes", key: "notes" },
    {
      title: "Chức năng",
      key: "action",
      render: (record: DataTelegramModal) => (
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

  const dataSource = dataTelegram.map((item) => ({
    ...item,
    key: item.id,
  }));

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeletes = async () => {
    setLoading(true);
    try {
      const idsToDelete = selectedRowKeys.map((key) => Number(key));
      await deleteTelegram(idsToDelete);
      toast.success("Xóa các mục thành công!");
      await setPageIndex(1);
      await setDataTelegram([])
      fetchTelegram();
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
    console.log(546, "call useEffect")
    fetchTelegram();
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
        <div className="text-[32px] font-bold py-5">
          Danh sách nhóm telegram
        </div>
        <div className="flex justify-between items-center mb-7">
          <Input
            placeholder="Tìm kiếm tên nhóm tài khoản ..."
            style={{
              width: 253,
              marginRight: 15,
            }}
            onChange={async (e) => {
              const value = e.target.value;
              setGlobalTerm(value);
              if (!value) {
                await setPageIndex(1);
                await setDataTelegram([])
                setCheckFilter(!checkFilter);
              }
            }}
            onPressEnter={async (e) => {
              await setPageIndex(1);
              await setDataTelegram([])
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
                setCurrentTelegram(null);
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
        title={
          currentTelegram
            ? "Chỉnh sửa nhóm tài khoản"
            : "Thêm mới nhóm tài khoản"
        }
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
            label="Tên nhóm telegram"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhóm telegram!" },
            ]}
          >
            <Input placeholder="Tên nhóm telegram" autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="ID nhóm telegram"
            name="chatId"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên ID nhóm telegram!",
              },
            ]}
          >
            <Input placeholder="Nhập ID nhóm telegram" autoComplete="off" />
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
              className={`{${isAddTelegram && "pointer-events-none"
                } bg-[#4B5CB8] border text-white font-medium w-[189px] !h-10`}
              loading={isAddTelegram}
            >
              {currentTelegram ? "Cập nhật" : "Thêm mới"}
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

export default Telegram;
