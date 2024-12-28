"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import BaseModal from "@/src/component/config/BaseModal";
import { Button, Form, Input, Space, Spin } from "antd";
import { addSheet, deleteSheet, getListSheet } from "@/src/services/sheet";
import { toast } from "react-toastify";
import DeleteModal from "@/src/component/config/modalDelete";
import { RoleContext } from "@/src/component/RoleWapper";
import LoadingTable from "@/src/component/LoadingTable";

export interface DataSheetModal {
  id?: number;
  name: string;
  linkUrl: string;
  notes: string;
}

interface FilterRole {
  Name: string;
  Value: string;
}

const Sheet = () => {
  const { dataRole } = useContext(RoleContext);
  const keys = dataRole.key;
  const values = `${dataRole.value}`;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentSheet, setCurrentSheet] = useState<DataSheetModal | null>(null);
  const [dataSheet, setDataSheet] = useState<DataSheetModal[]>([]);
  const [globalTerm, setGlobalTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 20;
  const [totalRecord, setTotalRecord] = useState(100);
  const [isLoading, setIsLoading] = useState(false);

  const [isAddSheet, setIsAddSheet] = useState<boolean>(false);

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
    if (pageIndex > 1 && dataSheet.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;

      fetchSheet(globalTerm).finally(() => {
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

  const fetchSheet = async (globalTerm?: string) => {
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
      const response = await getListSheet(pageIndex, pageSize, globalTerm, arr);
      const formattedData =
        response?.data?.source?.map((x: DataSheetModal) => ({
          id: x.id?.toString() || Date.now().toString(),
          name: x.name,
          linkUrl: x.linkUrl,
          notes: x.notes,
        })) || [];

      console.log(99, "call here")

      setTotalRecord(response?.data?.totalRecords || 0);

      setDataSheet((prevData) => [...prevData, ...formattedData]);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
      setIsLoading(false)
    }
  };

  useEffect(() => {
    fetchSheet(globalTerm);
  }, [keys]);

  const ClearFilter = () => {
    setGlobalTerm("");
  }

  const handleAddConfirm = async (isAddSheet: boolean) => {
    try {
      await form.validateFields();
      setIsAddSheet(isAddSheet);
      const formData = form.getFieldsValue();
      setLoading(true);
      if (currentSheet) {
        await addSheet({
          id: currentSheet.id,
          name: formData.name,
          linkUrl: formData.linkUrl,
          notes: formData.notes,
        });
        toast.success("Cập nhật thành công!");
        setIsAddModalOpen(false);
      } else {
        await addSheet({
          // id: Date.now(),
          name: formData.name,
          linkUrl: formData.linkUrl,
          notes: formData.notes,
        });
        toast.success("Thêm mới thành công!");
        setIsAddModalOpen(false);
      }
      form.resetFields();
      setCurrentSheet(null);
      await setPageIndex(1);
      await setDataSheet([]);
      ClearFilter();

      fetchSheet();
    } catch (error) {
      console.error("Lỗi:", error);
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setLoading(false);
      setIsAddSheet(false);
    }
  };

  const handleEditSheet = (x: DataSheetModal) => {
    setCurrentSheet(x);
    form.setFieldsValue({
      id: x.id,
      name: x.name,
      linkUrl: x.linkUrl,
      notes: x.notes,
    });
    setIsAddModalOpen(true);
  };

  const handleDeleteSheet = async (x: DataSheetModal) => {
    if (!x.id) {
      toast.error("ID không hợp lệ!");
      return;
    }
    setLoading(true);
    try {
      setIsAddModalOpen(false);
      await deleteSheet([x.id]);
      await setPageIndex(1);
      await setDataSheet([]);
      ClearFilter();

      fetchSheet();
      toast.success("Xóa thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa:", error);
      toast.error("Có lỗi khi xóa, vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccountGroup, setSelectedAccountGroup] =
    useState<DataSheetModal | null>(null);

  const handleDeleteClick = (tele: DataSheetModal) => {
    setSelectedAccountGroup(tele);
    setIsDeleteModalOpen(true);
  };

  const handleCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedAccountGroup(null);
  };

  const handleConfirmDelete = () => {
    if (selectedAccountGroup) {
      handleDeleteSheet(selectedAccountGroup);
      setIsDeleteModalOpen(false);
    }
  };

  const handleSearch = async (value: string) => {
    setGlobalTerm(value);
    try {
      if (value.trim() === "") {
        const data = await getListSheet(1, 20);
        const formattedData =
          data?.data?.source?.map((x: DataSheetModal) => ({
            id: x.id,
            name: x.name,
            linkUrl: x.linkUrl,
            notes: x.notes,
          })) || [];

        setDataSheet(formattedData);
      } else {
        // Nếu có giá trị tìm kiếm, gọi API với giá trị đó
        const data = await getListSheet(1, 20, value);
        const formattedData =
          data?.data?.source?.map((x: DataSheetModal) => ({
            id: x.id,
            name: x.name,
            linkUrl: x.linkUrl,
            notes: x.notes,
          })) || [];

        console.log(239, "call here")

        setDataSheet(formattedData);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm tài khoản ngân hàng:", error);
    }
  };

  const columns = [
    { title: "id", dataIndex: "id", key: "id", hidden: true },
    { title: "Tên nhóm trang tính", dataIndex: "name", key: "name" },
    {
      title: "Id trang tính",
      dataIndex: "linkUrl",
      key: "linkUrl",
      hidden: true,
    },
    { title: "Ghi chú", dataIndex: "notes", key: "notes" },
    {
      title: "Chức năng",
      key: "action",
      render: (record: DataSheetModal) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditSheet(record)}
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

  const dataSource = dataSheet.map((item) => ({
    ...item,
    key: item.id,
  }));

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeletes = async () => {
    setLoading(true);
    try {
      const idsToDelete = selectedRowKeys.map((key) => Number(key));
      const res = await deleteSheet(idsToDelete);

      if (!res || !res.success) {
        toast.error(res?.message);
      }
      else {
        toast.success("Xóa các mục thành công!");
        await setPageIndex(1);
        await setDataSheet([]);
        ClearFilter();

        fetchSheet();
        setSelectedRowKeys([]);
      }
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

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <Spin size="large" />
        </div>
      )}
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">Danh sách nhóm trang tính</div>
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
            }}
            onPressEnter={async (e) => {
              await setPageIndex(1);
              await setDataSheet([])
              handleSearch((e.target as HTMLInputElement).value);
            }}
            value={globalTerm}
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
                setCurrentSheet(null);
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
          rowSelection={rowSelection}
        />
      </div>
      <BaseModal
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        title={
          currentSheet ? "Chỉnh sửa nhóm tài khoản" : "Thêm mới nhóm tài khoản"
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
            label="Tên nhóm trang tính"
            name="name"
            rules={[
              { required: true, message: "Vui lòng nhập tên nhóm trang tính!" },
            ]}
          >
            <Input placeholder="Tên nhóm trang tính" autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="ID trang tính"
            name="linkUrl"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên ID trang tính!",
              },
            ]}
          >
            <Input placeholder="Nhập ID trang tính" autoComplete="off" />
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
              className={`${isAddSheet && "pointer-events-none"
                } bg-[#4B5CB8] border text-white font-medium w-[189px] !h-10"`}
              loading={isAddSheet}
            >
              {currentSheet ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </BaseModal>
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
        handleDeleteSheet={selectedAccountGroup}
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

export default Sheet;
