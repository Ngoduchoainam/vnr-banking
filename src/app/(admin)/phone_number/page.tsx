"use client";

import { Button, Form, Input, Space, Spin } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import React, { useContext, useEffect, useRef, useState } from "react";
import BaseModal from "@/src/component/config/BaseModal";
import {
  addPhoneNumber,
  deletePhone,
  getListPhone,
} from "@/src/services/phone";
import { PhoneNumberModal } from "@/src/component/modal/modalPhoneNumber";
import { toast } from "react-toastify";
import DeleteModal from "@/src/component/config/modalDelete";
import { RoleContext } from "@/src/component/RoleWapper";
import LoadingTable from "@/src/component/LoadingTable";

interface FilterRole {
  Name: string;
  Value: string;
}

const PhoneNumber: React.FC = () => {
  const { dataRole } = useContext(RoleContext);
  const keys = dataRole.key;
  const values = `${dataRole.value}`;

  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPhoneNumber, setCurrentPhoneNumber] =
    useState<PhoneNumberModal | null>(null);
  const [dataPhoneNumber, setDataPhoneNumber] = useState<PhoneNumberModal[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [globalTerm, setGlobalTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 20;
  const [currentTelegram, setCurrentTelegram] =
    useState<PhoneNumberModal | null>(null);

  const [isAddPhoneNumber, setIsAddPhoneNumber] = useState<boolean>(false);
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
    if (pageIndex > 1 && dataPhoneNumber.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;

      fetchListPhone(globalTerm).finally(() => {
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


  const fetchListPhone = async (globalTerm?: string) => {
    const arr: FilterRole[] = [];
    const addedParams = new Set<string>();
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    setLoading(true);
    if (pageIndex > 1) {
      setIsLoading(true)
    }
    try {
      const response = await getListPhone(pageIndex, pageSize, globalTerm, arr);
      const formattedData =
        response?.data?.source?.map((x: PhoneNumberModal) => ({
          id: x.id,
          number: x.number,
          com: x.com,
          notes: x.notes,
        })) || [];
      setTotalRecord(response?.data?.totalRecords || 0);

      setDataPhoneNumber((prevData) => [...prevData, ...formattedData]);
    } catch (error) {
      console.error("Error while loading phone list:", error);
    } finally {
      setLoading(false);
      setIsLoading(false)
    }
  };

  const ValidateAddPhone = (phone?: string) => {
    if (!phone.startsWith('0') || phone.length !== 10) {
      toast.error("Số điện thoại không đúng định dạng.");

      return false;
    }
    return true;
  }

  const ClearFilter = () => {
    setGlobalTerm("");
  }

  const handleAddConfirm = async (isAddPhoneNumber: boolean) => {
    try {
      await form.validateFields();

      const phone = form.getFieldsValue().number;
      if (!ValidateAddPhone(phone)) {
        return;
      }

      setIsAddPhoneNumber(isAddPhoneNumber);
      const formData = form.getFieldsValue();
      setLoading(true);
      const response = await addPhoneNumber({
        number: formData.number,
        com: formData.com,
        notes: formData.notes,
        id: formData.id,
      });
      if (response && response.success === false) {
        toast.error(response.message || "Thêm mới số điện thoại lỗi.");
        return;
      }
      form.resetFields();
      setCurrentPhoneNumber(null);
      setCurrentTelegram(null);
      toast.success(
        currentTelegram ? "Cập nhật thành công!" : "Thêm mới thành công!"
      );
      setIsAddModalOpen(false);
      await setPageIndex(1);
      await setDataPhoneNumber([]);
      ClearFilter();

      fetchListPhone();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error?.response?.data?.message) {
        toast.error(`Lỗi: ${error.response.data.message}`);
      } else {
        toast.error("Thêm mới số điện thoại lỗi.");
      }
    } finally {
      setLoading(false);
      setIsAddPhoneNumber(false);
    }
  };

  const handleEditPhoneNumber = (phone: PhoneNumberModal) => {
    setCurrentTelegram(phone);
    setCurrentPhoneNumber(phone);
    form.setFieldsValue({
      number: phone.number,
      com: phone.com,
      notes: phone.notes,
      id: phone.id,
    });
    setIsAddModalOpen(true);
  };

  const handleDeletePhoneNumber = async (phone: PhoneNumberModal) => {
    setLoading(true);
    try {
      setIsAddModalOpen(false);
      const response = await deletePhone([phone.id]);
      if (response.success === false) {
        toast.error(response.message || "Có lỗi xảy ra khi xóa số điện thoại.");
        return;
      }
      toast.success("Xóa số điện thoại thành công!");
      await setPageIndex(1);
      await setDataPhoneNumber([]);
      ClearFilter();

      fetchListPhone();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error deleting phone number:", error);
      if (error.isAxiosError && error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          toast.error(
            data.message || "Yêu cầu không hợp lệ. Không thể xóa số điện thoại."
          );
        } else {
          toast.error("Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
      } else {
        toast.error("Xảy ra lỗi khi xóa số điện thoại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (value: string) => {
    setGlobalTerm(value);
    try {
      setLoading(true);
      if (value.trim() === "") {
        const data = await getListPhone(1, 20);
        const formattedData =
          data?.data?.source?.map((x: PhoneNumberModal) => ({
            id: x.id,
            number: x.number || "",
            com: x.com,
            notes: x.notes,
          })) || [];

        setDataPhoneNumber(formattedData);
      } else {
        const data = await getListPhone(1, 20, value);
        const formattedData =
          data?.data?.source?.map((x: PhoneNumberModal) => ({
            id: x.id,
            number: x.number || "",
            com: x.com,
            notes: x.notes,
          })) || [];

        setDataPhoneNumber(formattedData);
      }
    } catch (error) {
      console.error("Error while searching for phone number:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: "id", dataIndex: "id", key: "id", hidden: true },
    { title: "Số điện thoại", dataIndex: "number", key: "number" },
    { title: "Nhà cung cấp mạng", dataIndex: "com", key: "com" },
    { title: "Ghi chú", dataIndex: "notes", key: "notes" },
    {
      title: "Hành động",
      key: "action",
      render: (record: PhoneNumberModal) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEditPhoneNumber(record)}
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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccountGroup, setSelectedAccountGroup] =
    useState<PhoneNumberModal | null>(null);

  const handleDeleteClick = (accountGroup: PhoneNumberModal) => {
    setSelectedAccountGroup(accountGroup);
    setIsDeleteModalOpen(true);
  };

  const handleCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedAccountGroup(null);
  };

  const handleConfirmDelete = () => {
    if (selectedAccountGroup) {
      handleDeletePhoneNumber(selectedAccountGroup);
      setIsDeleteModalOpen(false);
    }
  };

  const [checkFilter, setCheckFilter] = useState(false);
  useEffect(() => {
    fetchListPhone(globalTerm);
  }, [keys, checkFilter]);

  // ........................................................................//

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const dataSource = dataPhoneNumber.map((item) => ({
    ...item,
    key: item.id,
  }));

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeletes = async () => {
    setLoading(true);
    try {
      const idsToDelete = selectedRowKeys.map((key) => Number(key));
      const response = await deletePhone(idsToDelete);
      if (!response || !response.success) {
        toast.error(response?.message);
      }
      else {
        toast.success("Xóa các mục thành công!");
        await setPageIndex(1);
        await setDataPhoneNumber([]);
        ClearFilter();

        fetchListPhone();
        setSelectedRowKeys([]);
      }
    } catch (error: any) {
      console.error("Lỗi khi xóa:", error);
      if (error.isAxiosError && error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          toast.error(
            data.message || "Yêu cầu không hợp lệ. Không thể xóa các mục."
          );
        } else {
          toast.error("Đã có lỗi xảy ra. Vui lòng thử lại!");
        }
      } else {
        toast.error("Có lỗi xảy ra khi xóa!");
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

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <Spin size="large" />
        </div>
      )}
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">
          Danh sách số điện thoại
        </div>
        <div className="flex justify-between items-center mb-7">
          <Input
            placeholder="Tìm kiếm số điện ..."
            style={{
              width: 253,
              marginRight: 15,
            }}
            onChange={async (e) => {
              const value = e.target.value;
              setGlobalTerm(value);
              if (!value) {
                await setPageIndex(1);
                await setDataPhoneNumber([])
                setCheckFilter(!checkFilter);
              }
            }}
            onPressEnter={async (e) => {
              await setPageIndex(1);
              await setDataPhoneNumber([])
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
                setCurrentPhoneNumber(null);
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
          currentPhoneNumber
            ? "Chỉnh sửa số điện thoại"
            : "Thêm mới số điện thoại"
        }
        maskClosable={false}
      >
        <Form
          form={form}
          layout="vertical"
          className="flex flex-col gap-4 w-full"
        >
          <Form.Item hidden label="id" name="id">
            <Input hidden autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="Số điện thoại"
            name="number"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" },
            ]}
          >
            <Input placeholder="Nhập số điện thoại" autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="Nhà mạng"
            name="com"
            rules={[{ required: true, message: "Vui lòng nhập tên nhà mạng!" }]}
          >
            <Input placeholder="Nhập tên nhà mạng" autoComplete="off" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="notes">
            <Input.TextArea rows={4} placeholder="Ghi chú" />
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
              className={`${isAddPhoneNumber && "pointer-events-none"
                } bg-[#4B5CB8] border text-white font-medium w-[189px] !h-10`}
              loading={isAddPhoneNumber}
            >
              {currentPhoneNumber ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </Form>
      </BaseModal>
      <DeleteModal
        open={isDeleteModalOpen}
        onCancel={handleCancel}
        onConfirm={handleConfirmDelete}
        handleDeletePhoneNumber={selectedAccountGroup}
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
