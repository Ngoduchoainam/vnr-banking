/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useContext, useEffect, useState } from "react";
import Header from "@/src/component/Header";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Skeleton, Space, Table } from "antd";
import {
  addTelegramIntergration,
  deleteTelegramIntergration,
  getListTelegramIntergration,
} from "@/src/services/telegram_intergration_list";
import BaseModal from "@/src/component/config/BaseModal";
import { fetchBankAccounts } from "@/src/services/bankAccount";
import { getListTelegram, getTransType } from "@/src/services/telegram";
import DeleteModal from "@/src/component/config/modalDelete";
import { toast } from "react-toastify";
import { RoleContext } from "@/src/component/RoleWapper";

export interface ListTelegramIntegration {
  chatName: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  groupChatId: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bankAccountId: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bankId: any;
  id: number;
  code: string;
  accountNumber: number;
  fullName: string;
  chatId: string;
  name: string;
  transType: string;
  typeDescription: string;
}

interface FilterTeleIntergration {
  Name: string;
  Value: string;
}

type DataTypeWithKey = ListTelegramIntegration & { key: React.Key };

const TelegramIntegration = () => {
  const { dataRole } = useContext(RoleContext);
  const keys = dataRole.key;
  const values = `${dataRole.value}`;

  const [form] = Form.useForm();
  const [dataTelegramIntegration, setDataTelegramIntegration] = useState<
    ListTelegramIntegration[]
  >([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentTelegram, setCurrentTelegram] =
    useState<ListTelegramIntegration | null>(null);
  const [banks, setBanks] = useState<Array<ListTelegramIntegration>>([]);
  const [telegram, setTelegram] = useState<Array<ListTelegramIntegration>>([]);
  const [loading, setLoading] = useState(true);
  const [globalTerm, setGlobalTerm] = useState("");
  const [pageIndex] = useState(1);
  const [pageSize] = useState(50);
  const [isCreateTelegramInter, setIsCreateTelegramInter] = useState(false);

  const fetchListTelegramIntegration = async (
    globalTerm?: string,
    groupChat?: string,
    transType?: string,
    bankAccount?: string
  ) => {
    const arrTeleAccount: FilterTeleIntergration[] = [];
    const addedParams = new Set<string>();

    if (groupChat && !addedParams.has("bankAccountId")) {
      arrTeleAccount.push({
        Name: "groupChatId",
        Value: groupChat,
      });
      addedParams.add("groupChatId");
    }
    if (transType && !addedParams.has("transType")) {
      arrTeleAccount.push({
        Name: "transType",
        Value: transType,
      });
      addedParams.add("transType");
    }
    if (bankAccount && !addedParams.has("bankAccount")) {
      arrTeleAccount.push({
        Name: "bankAccountId",
        Value: bankAccount,
      });
      addedParams.add("bankAccountId");
    }
    arrTeleAccount.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);

    setLoading(true);
    try {
      const response = await getListTelegramIntergration(
        pageIndex,
        pageSize,
        globalTerm,
        arrTeleAccount
      );
      const formattedData =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response?.data?.source?.map((item: any) => {
          return {
            id: item.id, // id
            bankAccountId: item.bankAccount.id, // id tài khoản ngân hàng
            groupChatId: item.groupChatId, // id nhóm chat tele
            code: item.bank.code, // mã ngân hàng
            accountNumber: item.bankAccount.accountNumber, // stk
            fullName: item.bankAccount.fullName, // tên chủ tk
            chatId: item.groupChat.chatId, // mã nhóm chat tele
            name: item.groupChat.name, // tên nhóm chat
            transType: item.transType, // loại giao dịch
            bankId: item.bank.name,
            chatName: item.groupChat.name,
            typeDescription: item.typeDescription,
          };
        }) || [];

      setDataTelegramIntegration(formattedData);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListTelegramIntegration();
  }, [keys]);

  const genBankData = async () => {
    try {
      const bankData = await fetchBankAccounts(1, 50);
      const formattedBanks =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        bankData?.data?.source?.map((bank: any) => ({
          value: bank.id,
          label: `${bank.accountNumber} - ${bank.bank.code} - ${bank.fullName}`,
          bankAccountId: bank.id,
        })) || [];

      setBanks(formattedBanks);
      // setBankAccountFilter(formattedBanks);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  const genTelegramData = async () => {
    try {
      const dataTelegram = await getListTelegram(1, 50);
      const formattedTelegram =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataTelegram?.data?.source?.map((tele: any) => ({
          value: tele.id,
          label: tele.name,
          groupChatId: tele.id,
        })) || [];
      setTelegram(formattedTelegram);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  const [transType, setTransType] = useState<Array<ListTelegramIntegration>>(
    []
  );

  const genTransTypes = async (
    bankAccountId: number,
    groupChatId: number,
    id?: number
  ) => {
    try {
      const dataTransType = await getTransType(bankAccountId, groupChatId, id);
      const res =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (await dataTransType?.data?.map((tele: any) => ({
          value: tele.value,
          label: tele.text,
          transType: tele.value,
        }))) || [];
      setTransType(res);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  const handleAddConfirm = async (isCreateTelegramInter: boolean) => {
    if (loading) return;

    try {
      await form.validateFields();
      setIsAddModalOpen(false);
      setLoading(true);
      setIsCreateTelegramInter(isCreateTelegramInter);
      const formData = form.getFieldsValue();
      let response;

      if (currentTelegram) {
        response = await addTelegramIntergration({
          bankAccountId: formData.bankAccountId,
          id: currentTelegram.id,
          groupChatId: formData.groupChatId,
          transType: formData.transType,
          accountNumber: formData.accountNumber,
          chatName: "",
          bankId: undefined,
          code: "",
          fullName: "",
          chatId: "",
          name: "",
          typeDescription: formData.typeDescription,
        });
      } else {
        response = await addTelegramIntergration({
          bankAccountId: bankAccountIdSelect,
          id: formData.id,
          groupChatId: formData.groupChatId,
          transType: formData.transType,
          accountNumber: formData.accountNumber,
          chatName: "",
          bankId: undefined,
          code: "",
          fullName: "",
          chatId: "",
          name: "",
          typeDescription: formData.typeDescription,
        });
      }

      setIsAddModalOpen(false);
      form.resetFields();
      setCurrentTelegram(null);
      fetchListTelegramIntegration();
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
      setIsCreateTelegramInter(false);
    }
  };

  const handleEdit = (record: ListTelegramIntegration) => {
    setCurrentTelegram(record);
    form.setFieldsValue({
      bankAccountId: record.bankAccountId,
      accountNumber: record.accountNumber,
      id: record.id,
      groupChatId: record.groupChatId,
      transType: record.transType,
      accountFullName:
        record.accountNumber + " - " + record.code + " - " + record.fullName,
      chatName: record.chatName,
      typeDescription: record.typeDescription,
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (x: ListTelegramIntegration) => {
    setLoading(true);
    try {
      setIsAddModalOpen(false);
      await deleteTelegramIntergration([x.id]);
      await fetchListTelegramIntegration();
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản ngân hàng:", error);
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
          data?.data?.source?.map((x: ListTelegramIntegration) => ({
            bankAccountId: x.accountNumber,
            id: x.id, // id của bản ghi
            groupChatId: x.groupChatId, // id nhóm chat trên Telegram
            transType: x.transType,
            accountNumber: x.accountNumber,
            chatName: "",
            bankId: undefined,
            code: "",
            fullName: "",
            chatId: "",
            name: "",
          })) || [];

        setDataTelegramIntegration(formattedData);
      } else {
        // Nếu có giá trị tìm kiếm, gọi API với giá trị đó
        const data = await getListTelegram(1, 20, value);
        const formattedData =
          data?.data?.source?.map((x: ListTelegramIntegration) => ({
            bankAccountId: x.accountNumber,
            id: x.id, // id của bản ghi
            groupChatId: x.groupChatId, // id nhóm chat trên Telegram
            transType: x.transType,
            accountNumber: x.accountNumber,
            chatName: "",
            bankId: undefined,
            code: "",
            fullName: "",
            chatId: "",
            name: "",
          })) || [];

        setDataTelegramIntegration(formattedData);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm tài khoản ngân hàng:", error);
    }
  };

  useEffect(() => {
    fetchListTelegramIntegration();
  }, []);

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", hidden: true },
    { title: "Ngân hàng", dataIndex: "code", key: "code" },
    { title: "Số tài khoản", dataIndex: "accountNumber", key: "accountNumber" },
    { title: "Tên chủ tài khoản", dataIndex: "fullName", key: "fullName" },
    { title: "ID nhóm telegram", dataIndex: "chatId", key: "chatId" },
    { title: "Tên nhóm telegram", dataIndex: "name", key: "name" },
    {
      title: "Loại giao dịch",
      dataIndex: "transType",
      key: "transType",
      render: (transType: string) => (
        <>
          {transType === "1" ? (
            <div className="font-semibold text-[#0356B6]">Cả hai</div>
          ) : transType === "2" ? (
            <div className="font-semibold text-[#D40606]">Tiền ra</div>
          ) : (
            <div className="font-semibold text-[#01AF36]">Tiền vào</div>
          )}
        </>
      ),
    },
    {
      title: "Chức năng",
      key: "action",
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      render: (record: ListTelegramIntegration) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)} icon={<EditOutlined />}>
            Chỉnh sửa
          </Button>
          <Button
            onClick={() => handleDeleteClick(record)}
            icon={<DeleteOutlined />}
            danger
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccountGroup, setSelectedAccountGroup] =
    useState<ListTelegramIntegration | null>(null);

  const handleDeleteClick = (tele: ListTelegramIntegration) => {
    setSelectedAccountGroup(tele);
    setIsDeleteModalOpen(true);
  };

  const handleCancel = () => {
    setIsDeleteModalOpen(false);
    setSelectedAccountGroup(null);
  };

  const handleConfirmDelete = () => {
    if (selectedAccountGroup) {
      handleDelete(selectedAccountGroup);
      setIsDeleteModalOpen(false);
    }
  };

  const options = [
    { value: "3", label: "Tiền vào" },
    { value: "2", label: "Tiền ra" },
    { value: "1", label: "Cả hai" },
  ];

  const [teleGroupChatFilter, setTeleGroupChatFilter] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [bankFilter, setBankFilter] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [groupChatFilter, setGroupChatFilter] = useState();
  const [transTypeFilter, setTransTypeFilter] = useState();
  const [bankAccountFilter, setBankAccountFilter] = useState();

  const [filterParams, setFilterParams] = useState<{
    groupChatId?: string;
  }>({});

  const handleSelectChange = (
    groupChat?: string,
    transType?: string,
    bankAccount?: string
  ) => {
    setFilterParams((prevParams) => ({
      ...prevParams,
      groupChatId: groupChat,
      transType: transType,
      bankAccount: bankAccount,
    }));
  };

  const handleFilterGroupChat = async (groupChat?: string) => {
    const arr: FilterTeleIntergration[] = [];
    const groupChatFilter: FilterTeleIntergration = {
      Name: "groupChatId",
      Value: groupChat!,
    };
    const obj: FilterTeleIntergration = {
      Name: keys!,
      Value: values!,
    };
    arr.push(obj, groupChatFilter);
    try {
      const fetchBankAccountAPI = await getListTelegram(
        pageIndex,
        pageSize,
        globalTerm,
        arr
      );
      if (
        fetchBankAccountAPI &&
        fetchBankAccountAPI.data &&
        fetchBankAccountAPI.data.source
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = fetchBankAccountAPI.data.source.map((x: any) => ({
          value: x.id,
          label: x.name || "Không xác định",
        }));
        setTeleGroupChatFilter(res);
      } else {
        setTeleGroupChatFilter([]);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const bankAccountFilterAPI = async (bankAccount?: string) => {
    const arr: FilterTeleIntergration[] = [];
    const bankAccountFilter: FilterTeleIntergration = {
      Name: "bankAccountId",
      Value: bankAccount!,
    };
    const obj: FilterTeleIntergration = {
      Name: keys!,
      Value: values!,
    };
    arr.push(obj, bankAccountFilter);
    try {
      const fetchBankAccountAPI = await fetchBankAccounts(pageIndex, pageSize);
      if (
        fetchBankAccountAPI &&
        fetchBankAccountAPI.data &&
        fetchBankAccountAPI.data.source
      ) {
        const res =
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          fetchBankAccountAPI?.data?.source?.map((bank: any) => ({
            value: bank.id,
            label: bank.bank.code,
            bankAccountId: bank.id,
          })) || [];
        setBankFilter(res);
      } else {
        setBankFilter([]);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await handleFilterGroupChat();
      await bankAccountFilterAPI();
    };

    fetchData();
  }, [filterParams]);

  const [checkFilter, setCheckFilter] = useState(false);
  useEffect(() => {
    fetchListTelegramIntegration(groupChatFilter);
  }, [checkFilter]);

  const [bankAccountIdSelect, setBankAccountIdSelect] = useState();

  // ......................................................................................//

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const dataSource = dataTelegramIntegration.map((item) => ({
    ...item,
    key: item.id,
  }));

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeletes = async () => {
    setLoading(true);
    try {
      const idsToDelete = selectedRowKeys.map((key) => Number(key));
      await deleteTelegramIntergration(idsToDelete);
      toast.success("Xóa các mục thành công!");
      await fetchListTelegramIntegration();
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

  return (
    <>
      <Header />
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">
          Danh sách tích hợp telegram
        </div>
        <div className="flex justify-between items-center mb-7">
          <div>
            <Input
              placeholder="Tìm kiếm tên tài khoản ..."
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
            <Space direction="horizontal" size="middle">
              <Select
                mode="multiple"
                options={teleGroupChatFilter}
                placeholder="Nhóm tài khoản"
                style={{ width: 245 }}
                allowClear
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(value: any) => {
                  setGroupChatFilter(value);
                  if (!value) {
                    handleSelectChange(value, transTypeFilter);
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchListTelegramIntegration(
                      globalTerm,
                      value,
                      transTypeFilter,
                      bankAccountFilter
                    );
                  }
                }}
              />
            </Space>
            <Space direction="horizontal" size="middle">
              <Select
                options={options}
                placeholder="Loại giao dịch"
                style={{ width: 245, margin: "0 10px", height: 40 }}
                allowClear
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(value: any) => {
                  setTransTypeFilter(value);
                  if (!value) {
                    handleSelectChange(groupChatFilter, value);
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchListTelegramIntegration(
                      globalTerm,
                      groupChatFilter,
                      value,
                      bankAccountFilter
                    );
                  }
                }}
              />
            </Space>
            <Space direction="horizontal" size="middle">
              <Select
                mode="multiple"
                options={bankFilter}
                placeholder="Tên ngân hàng"
                style={{ width: 245, marginRight: "10px" }}
                allowClear
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(value: any) => {
                  setBankAccountFilter(value);
                  if (!value) {
                    handleSelectChange(groupChatFilter, transTypeFilter, value);
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchListTelegramIntegration(
                      globalTerm,
                      groupChatFilter,
                      transTypeFilter,
                      value
                    );
                  }
                }}
              />
            </Space>
          </div>
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
          currentTelegram
            ? "Chỉnh sửa tài khoản tích hợp telegram"
            : "Thêm mới tài khoản tích hợp telegram"
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
          <Form.Item hidden label="bankAccountId" name="bankAccountId">
            <Input autoComplete="off" />
          </Form.Item>
          {currentTelegram ? (
            <Form.Item
              label="Tài khoản ngân hàng"
              name="accountFullName"
              rules={[{ required: true, message: "Vui lòng chọn ngân hàng!" }]}
            >
              <Select
                disabled
                placeholder="Chọn ngân hàng"
                onFocus={genBankData}
                options={banks}
                onChange={(value) => setBankAccountIdSelect(value)}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="Tài khoản ngân hàng"
              name="accountFullName"
              rules={[{ required: true, message: "Vui lòng chọn ngân hàng!" }]}
            >
              <Select
                placeholder="Chọn ngân hàng"
                onFocus={genBankData}
                options={banks}
                onChange={async (value) => {
                  setBankAccountIdSelect(value);
                  const selectedGroup = await banks.find(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (item: any) => item.value === value
                  );
                  if (selectedGroup) {
                    form.setFieldsValue({
                      bankAccountId: selectedGroup.bankAccountId,
                    });
                  }
                }}
              />
            </Form.Item>
          )}
          <Form.Item
            label="Chọn nhóm telegram"
            name="chatName"
            rules={[
              { required: true, message: "Vui lòng chọn nhóm telegram!" },
            ]}
          >
            <Select
              placeholder="Chọn nhóm telegram"
              onFocus={genTelegramData}
              options={telegram}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={async (value: any) => {
                const selectedGroup = await telegram.find(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (item: any) => item.value === value
                );
                if (selectedGroup) {
                  form.setFieldsValue({
                    groupChatId: selectedGroup.groupChatId,
                  });
                }
              }}
            />
          </Form.Item>
          <Form.Item
            hidden
            label="Chọn nhóm telegram 2"
            name="groupChatId"
            rules={[
              { required: true, message: "Vui lòng chọn nhóm telegram!" },
            ]}
          >
            <Select
              placeholder="Chọn nhóm telegram"
              onFocus={genTelegramData}
              options={telegram}
            />
          </Form.Item>
          <Form.Item
            label="Chọn loại giao dịch"
            name="typeDescription"
            rules={[
              { required: true, message: "Vui lòng chọn loại tài khoản!" },
            ]}
          >
            <Select
              placeholder="Chọn loại giao dịch"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onFocus={() => {
                const formData = form.getFieldsValue();
                genTransTypes(
                  formData.bankAccountId,
                  formData.groupChatId,
                  formData.id
                );
              }}
              options={transType}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onChange={async (value: any) => {
                const selectedGroup = await transType.find(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (item: any) => item.value === value
                );
                if (selectedGroup) {
                  form.setFieldsValue({
                    transType: selectedGroup.transType,
                  });
                }
              }}
            />
          </Form.Item>
          <Form.Item hidden label="Chọn loại giao dịch" name="transType">
            <Select />
          </Form.Item>
          <div className="flex justify-end">
            <Button
              onClick={() => setIsAddModalOpen(false)}
              className="w-[189px] !h-10"
            >
              Đóng
            </Button>
            <div className="w-4" />
            <Button
              type="primary"
              onClick={() => handleAddConfirm(true)}
              loading={isCreateTelegramInter}
              disabled={loading}
              className={`${
                isCreateTelegramInter && "pointer-events-none"
              } bg-[#4B5CB8] border text-white font-medium w-[189px] !h-10`}
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
        handleDeleteTeleIntergration={selectedAccountGroup}
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

export default TelegramIntegration;
