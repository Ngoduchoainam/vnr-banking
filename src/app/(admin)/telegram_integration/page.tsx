"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Space, Spin } from "antd";
import {
  deleteTelegramIntergration,
  getListTelegramIntergration,
  addTelegramIntergration
} from "@/src/services/telegram_intergration_list";
import BaseModal from "@/src/component/config/BaseModal";
import { fetchBankAccounts, getBank } from "@/src/services/bankAccount";
import { getListTelegram } from "@/src/services/telegram";
import DeleteModal from "@/src/component/config/modalDelete";
import { toast } from "react-toastify";
import { RoleContext } from "@/src/component/RoleWapper";
import CustomSelect from "@/src/component/CustomSelect";
import LoadingTable from "@/src/component/LoadingTable";
import "./style.css";

export interface ListTelegramIntegration {
  chatName?: string;
  groupChatId?: any;
  bankAccountId?: any;
  bankId?: any;
  id?: number;
  code?: string;
  accountNumber?: number;
  fullName?: string;
  chatId?: string;
  name?: string;
  transType?: string;
  typeDescription?: string;
}

interface FilterTeleIntergration {
  Name: string;
  Value: string;
}

interface OptionBank {
  bankAccountId?: number,
  label?: string,
  value?: number,
}

interface OptionTelegram {
  groupChatId?: number,
  label?: string,
  value?: number,
}

interface FilterProducts {
  Name: string;
  Value: any;
}

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
  const [banks, setBanks] = useState<Array<OptionBank>>([]);
  const [telegram, setTelegram] = useState<Array<OptionTelegram>>([]);
  const [loading, setLoading] = useState(true);
  const [globalTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize] = useState(20);
  const [isCreateTelegramInter, setIsCreateTelegramInter] = useState(false);
  const [totalRecord, setTotalRecord] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [bankAccountId, setBankAccountId] = useState();

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
    if (pageIndex > 1 && dataTelegramIntegration.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;

      fetchListTelegramIntegration(
        globalTerm,
        groupChatFilter,
        transTypeFilter,
        bankId,
        bankAccountId).finally(() => {
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


  const fetchListTelegramIntegration = async (
    globalTerm?: string,
    groupChat?: string,
    transType?: string,
    bank?: number,
    bankAccount?: string,
    pageIndexFilter?: number
  ) => {

    console.log(globalTerm, groupChat, transType, bank, bankAccount)
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
    if (bank && !addedParams.has("bankId")) {
      arrTeleAccount.push({
        Name: "bankId",
        Value: bank.toString(),
      });
      addedParams.add("bankId");
    }
    if (bankAccount && !addedParams.has("bankAccountId")) {
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
    if (pageIndex > 1) {
      setIsLoading(true)
    }
    try {
      const response = await getListTelegramIntergration(
        pageIndexFilter || pageIndex,
        pageSize,
        globalTerm,
        arrTeleAccount
      );

      const formattedData =
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

      setTotalRecord(response?.data?.totalRecords || 0);

      setDataTelegramIntegration((prevData) => [...prevData, ...formattedData]);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
      setIsLoading(false)
    }
  };

  const genBankData = async () => {
    try {
      const bankData = await fetchBankAccounts(1, 100);
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
      const dataTelegram = await getListTelegram(1, 100);
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

  const ClearFilter = () => {
    setBankId(undefined);
    setBankAccountId(undefined);
    setGroupChatFilter(undefined);
    setTransTypeFilter(undefined);
  }

  const handleAddConfirm = async (isCreateTelegramInter: boolean) => {
    if (loading) return;

    try {
      await form.validateFields();
      const formObject = form.getFieldsValue();

      const item: ListTelegramIntegration = {
        id: formObject.id,
        bankAccountId: formObject.bankAccountId,
        groupChatId: formObject.groupChatId,
        transType: formObject.transType
      }
      await addTelegramIntergration(item);
      setIsAddModalOpen(false);
      setLoading(true);
      setIsCreateTelegramInter(isCreateTelegramInter);

      setIsAddModalOpen(false);
      form.resetFields();
      setCurrentTelegram(null);
      await setPageIndex(1);
      await setDataTelegramIntegration([]);
      ClearFilter();

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
      await setPageIndex(1);
      await setDataTelegramIntegration([]);
      ClearFilter();

      fetchListTelegramIntegration();
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản ngân hàng:", error);
    } finally {
      setLoading(false);
    }
  };

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
  const [bankId, setBankId] = useState();
  const [bankAccountFilter, setBankAccountFilter] = useState<
    Array<{ value: string; label: string }>
  >([]);
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

  const bankAccountFilterAPI = async () => {
    const arr: FilterProducts[] = [];
    const addedParams = new Set<string>();
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    try {
      const fetchBankDataAPI = await getBank(1, 100, arr);

      if (
        fetchBankDataAPI &&
        fetchBankDataAPI.data &&
        fetchBankDataAPI.data.source
      ) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res = fetchBankDataAPI.data.source.map((x: any) => ({
          value: x.id,
          label: x.code || "Không xác định",
        }));
        console.log("fetchBankDataAPI", fetchBankDataAPI);

        setBankFilter(res);
      } else {
        setBankFilter([]);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const filterBankAccount = async (bankId?: string) => {
    // console.log(352, bankId)
    const arr: FilterProducts[] = [];
    const addedParams = new Set<string>();
    arr.push({
      Name: "bankId",
      Value: bankId,
    });
    arr.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    try {
      const fetchBankAccountAPI = await fetchBankAccounts(
        1,
        100,
        undefined,
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
          label: x.fullName + "-" + x.accountNumber || "Không xác định",
        }));

        setBankAccountFilter(res);
      } else {
        setBankAccountFilter([]);
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
    fetchListTelegramIntegration(globalTerm,
      groupChatFilter,
      transTypeFilter,
      bankId,
      bankAccountId);
  }, [checkFilter]);


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
      const res = await deleteTelegramIntergration(idsToDelete);

      if (!res || !res.success) {
        toast.error(res?.message);
      }
      else {
        toast.success("Xóa các mục thành công!");
        await setPageIndex(1);
        await setDataTelegramIntegration([]);
        ClearFilter();

        fetchListTelegramIntegration();
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

  useEffect(() => {
    filterBankAccount();
  }, []);

  return (
    <>
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
          <Spin size="large" />
        </div>
      )}
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">
          Danh sách tích hợp telegram
        </div>
        <div className="flex justify-between items-center mb-7">
          <div className="ant-space-container-telegram-integration">
            <Space direction="horizontal" size="middle">
              <CustomSelect
                options={bankFilter}
                placeholder="Tên ngân hàng"
                style={{ width: 245, marginRight: "10px" }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={async (value: any) => {
                  setBankId(value);
                  await setPageIndex(1);
                  await setDataTelegramIntegration([]);
                  filterBankAccount(value);
                  if (!value) {
                    handleSelectChange(groupChatFilter, transTypeFilter, value);
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchListTelegramIntegration(
                      globalTerm,
                      groupChatFilter,
                      transTypeFilter,
                      value,
                      bankAccountId,
                      1
                    );
                  }
                }}
                value={bankId}
              />
              <CustomSelect
                mode="multiple"
                options={bankAccountFilter}
                placeholder="Tài khoản ngân hàng"
                style={{ width: 245 }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={async (value: any) => {

                  const parsedValue = Array.isArray(value)
                    ? value
                    :
                    value.split(",").map((item: any) => item.trim());

                  await setPageIndex(1);
                  await setDataTelegramIntegration([])
                  await setBankAccountId(parsedValue);


                  fetchListTelegramIntegration(
                    globalTerm,
                    groupChatFilter,
                    transTypeFilter,
                    bankId,
                    value,
                    1
                  );
                }}
                value={bankAccountId}
              />
              <CustomSelect
                mode="multiple"
                options={teleGroupChatFilter}
                placeholder="Nhóm tài khoản"
                style={{ width: 245 }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={async (value: any) => {
                  setGroupChatFilter(value);
                  await setPageIndex(1);
                  await setDataTelegramIntegration([])
                  if (!value) {
                    handleSelectChange(value, transTypeFilter);
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchListTelegramIntegration(
                      globalTerm,
                      value,
                      transTypeFilter,
                      bankId,
                      bankAccountId,
                      1
                    );
                  }
                }}
                value={groupChatFilter}
              />
              <Select
                options={options}
                placeholder="Loại giao dịch"
                style={{ width: 245, margin: "0 10px" }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={async (value: any) => {
                  setTransTypeFilter(value);
                  await setPageIndex(1);
                  await setDataTelegramIntegration([])
                  if (!value) {
                    handleSelectChange(groupChatFilter, value);
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchListTelegramIntegration(
                      globalTerm,
                      groupChatFilter,
                      value,
                      bankId,
                      bankAccountId,
                      1
                    );
                  }
                }}
                value={transTypeFilter}
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
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={async (value) => {
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
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
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
              options={options}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={async (value: any) => {
                if (value) {
                  form.setFieldsValue({
                    transType: value,
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
              className={`${isCreateTelegramInter && "pointer-events-none"
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
