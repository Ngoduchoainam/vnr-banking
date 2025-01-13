"use client";

import React, { useContext, useEffect, useRef, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Form, Input, Select, Space, Spin } from "antd";
import {
  addSheetIntergration,
  deleteSheetIntergration,
  getListSheetIntergration,
} from "@/src/services/sheet_intergration";
import BaseModal from "@/src/component/config/BaseModal";
import { fetchBankAccounts, getBank } from "@/src/services/bankAccount";
import { getListSheet } from "@/src/services/sheet";
import DeleteModal from "@/src/component/config/modalDelete";
import { toast } from "react-toastify";
import { RoleContext } from "@/src/component/RoleWapper";
import CustomSelect from "@/src/component/CustomSelect";
import LoadingTable from "@/src/component/LoadingTable";

export interface ListSheetIntegration {
  id: number;
  code: string;
  accountNumber: string;
  fullName: string;
  linkUrl: string;
  transType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bankAccountId?: any;
  sheetId: number;
  name: string;
  typeDescription: string;
}

interface FilterSheetIntergration {
  Name: string;
  Value: string;
}

interface FilterProducts {
  Name: string;
  Value: any;
}

const SheetIntergration = () => {
  const { dataRole } = useContext(RoleContext);
  const keys = dataRole.key;
  const values = `${dataRole.value}`;

  const [form] = Form.useForm();
  const [dataSheetIntegration, setDataSheetIntegration] = useState<
    ListSheetIntegration[]
  >([]);
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [globalTerm, setGlobalTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentSheet, setCurrentSheet] = useState<ListSheetIntegration | null>(
    null
  );
  const [banks, setBanks] = useState([]);
  const [sheet, setSheet] = useState([]);
  const [isAddSheetInter, setIsAddSheetInter] = useState<boolean>(false);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 20;
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
    if (pageIndex > 1 && dataSheetIntegration.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;

      fetchSheetIntegration(
        globalTerm,
        sheetIdFilter,
        transTypeFilter,
        bankAccountId,
        bankId).finally(() => {
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

  const fetchSheetIntegration = async (
    globalTerm?: string,
    sheetId?: string,
    transType?: string,
    bankAccount?: string,
    bank?: string,
    pageIndexFilter?: number
  ) => {
    const arrSheet: FilterSheetIntergration[] = [];
    const addedParams = new Set<string>();

    if (sheetId && !addedParams.has("sheetId")) {
      arrSheet.push({
        Name: "sheetId",
        Value: sheetId,
      });
      addedParams.add("sheetId");
    }
    if (transType && !addedParams.has("transType")) {
      arrSheet.push({
        Name: "transType",
        Value: transType,
      });
      addedParams.add("transType");
    }
    if (bankAccount && !addedParams.has("bankAccountId")) {
      arrSheet.push({
        Name: "bankAccountId",
        Value: bankAccount,
      });
      addedParams.add("bankAccountId");
    }

    if (bank && !addedParams.has("bankId")) {
      arrSheet.push({
        Name: "bankId",
        Value: bank,
      });
      addedParams.add("bankId");
    }

    arrSheet.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    setLoading(true);
    if (pageIndex > 1) {
      setIsLoading(true)
    }
    try {
      const response = await getListSheetIntergration(
        pageIndexFilter || pageIndex,
        pageSize,
        globalTerm,
        arrSheet
      );

      const formattedData =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        response?.data?.source?.map((item: any) => ({
          id: item.id, // id
          code: item.bank.code, // Mã ngân hàng
          accountNumber: item.bankAccount.accountNumber, // stk
          fullName: item.bankAccount.fullName, // tên chủ tk
          linkUrl: item.sheetDetail.linkUrl, // link url
          name: item.sheetDetail.name, // Tên sheet
          transType: item.transType, // status loại giao dịch
          bankAccountId: item.bankAccount.id,
          sheetId: item.sheetDetail.id, // id của sheet
          typeDescription: item.typeDescription,
        })) || [];
      setTotalRecord(response?.data?.totalRecords || 0);
      setDataSheetIntegration((prevData) => [...prevData, ...formattedData]);
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
          // label: bank.accountNumber || bank.code || "Không xác định",
          label: `${bank.accountNumber} - ${bank.bank.code} - ${bank.fullName}`,
          bankAccountId: bank.id,
        })) || [];
      setBanks(formattedBanks);
    } catch (error) {
      console.error("Error fetching banks:", error);
    }
  };

  const genSheetData = async () => {
    try {
      const dataTelegram = await getListSheet(1, 100);
      const formattedTelegram =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dataTelegram?.data?.source?.map((sheet: any) => ({
          value: sheet.id,
          label: sheet.name,
          sheetId: sheet.id,
        })) || [];
      setSheet(formattedTelegram);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  const ClearFilter = () => {
    setBankId(undefined);
    setBankAccountId(undefined);
    setSheetIdFilter(undefined);
    setTransTypeFilter(undefined);
  }

  const handleAddConfirm = async (isAddSheetInter: boolean) => {
    try {
      await form.validateFields();
      setIsAddModalOpen(false);
      setIsAddSheetInter(isAddSheetInter);
      const formData = form.getFieldsValue();
      setLoading(true);
      if (currentSheet) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const response = await addSheetIntergration({
          id: formData.id, // id
          code: formData.code, // Mã ngân hàng
          accountNumber: formData.accountNumber, // stk
          fullName: formData.fullName, // tên chủ tk
          linkUrl: formData.linkUrl, // link url
          transType: formData.transType, // status loại giao dịch
          bankAccountId: formData.bankAccountId,
          sheetId: formData.sheetId,
          name: formData.name,
          typeDescription: formData.typeDescription,
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const response = await addSheetIntergration({
          id: formData.id, // id
          code: formData.code, // Mã ngân hàng
          accountNumber: formData.accountNumber, // stk
          fullName: formData.fullName, // tên chủ tk
          linkUrl: formData.linkUrl, // link url // đổi tên thử thành sheetId
          transType: formData.transType, // status loại giao dịch
          bankAccountId: bankAccountIdSelect, // hình như không nhầm thì là lưu stk vào trường có tên là bankAccountId
          sheetId: formData.sheetId, // id của sheet
          name: formData.name,
          typeDescription: formData.typeDescription,
        });
      }

      setIsAddModalOpen(false);
      form.resetFields();
      setCurrentSheet(null);
      await setPageIndex(1);
      await setDataSheetIntegration([]);
      ClearFilter();

      fetchSheetIntegration();
    } catch (error) {
      console.error("Lỗi:", error);
    } finally {
      setLoading(false);
      setIsAddSheetInter(false);
    }
  };

  const handleEdit = (record: ListSheetIntegration) => {
    setCurrentSheet(record);
    form.setFieldsValue({
      id: record.id, // id
      code: record.code, // Mã ngân hàng
      accountNumber: record.accountNumber, // stk
      fullName: record.fullName, // tên chủ tk
      linkUrl: record.linkUrl, // link url
      transType: record.transType, // status loại giao dịch
      bankAccountId: record.bankAccountId,
      sheetId: record.sheetId, // id của sheet
      accountFullName:
        record.accountNumber + " - " + record.code + " - " + record.fullName,
      sheetName: record.name,
      typeDescription: record.typeDescription,
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = async (x: ListSheetIntegration) => {
    setLoading(true);
    try {
      setIsAddModalOpen(false);
      await deleteSheetIntergration([x.id]);
      await setPageIndex(1);
      await setDataSheetIntegration([]);
      ClearFilter();

      fetchSheetIntegration();
    } catch (error) {
      console.error("Lỗi khi xóa tài khoản ngân hàng:", error);
    } finally {
      setLoading(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAccountGroup, setSelectedAccountGroup] =
    useState<ListSheetIntegration | null>(null);

  const handleDeleteClick = (tele: ListSheetIntegration) => {
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

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", hidden: true },
    {
      title: "bankAccountId",
      dataIndex: "bankAccountId",
      key: "bankAccountId",
      hidden: true,
    },
    { title: "Ngân hàng", dataIndex: "code", key: "code" },
    { title: "Số tài khoản", dataIndex: "accountNumber", key: "accountNumber" },
    { title: "Tên chủ tài khoản", dataIndex: "fullName", key: "fullName" },
    {
      title: "Tên trang tính",
      dataIndex: "linkUrl",
      key: "linkUrl",
      hidden: true,
    },
    { title: "Tên trang tính", dataIndex: "name", key: "name" },
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
      render: (record: ListSheetIntegration) => (
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

  const options = [
    { value: "3", label: "Tiền vào" },
    { value: "2", label: "Tiền ra" },
    { value: "1", label: "Cả hai" },
  ];

  const [sheetFilter, setSheetFilter] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [bankFilter, setBankFilter] = useState<
    Array<{ value: string; label: string }>
  >([]);

  const [sheetIdFilter, setSheetIdFilter] = useState();
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
      bankAccountId: bankAccount,
    }));
  };

  const handleFilterSheet = async () => {
    try {
      const { groupChatId } = filterParams;
      const searchParams = groupChatId
        ? [{ Name: "groupChatId", Value: groupChatId }]
        : [];
      const fetchBankAccountAPI = await getListSheet(
        pageIndex,
        pageSize,
        globalTerm,
        searchParams
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
        setSheetFilter(res);
      } else {
        setSheetFilter([]);
      }
    } catch (error) {
      console.error("Error fetching bank accounts:", error);
    }
  };

  const filterBankAPI = async () => {
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

  useEffect(() => {
    const fetchData = async () => {
      await handleFilterSheet();
      await filterBankAPI();
    };

    fetchData();
  }, [filterParams]);

  const [checkFilter, setCheckFilter] = useState(false);
  useEffect(() => {
    fetchSheetIntegration(
      globalTerm,
      sheetIdFilter,
      transTypeFilter,
      bankAccountId,
      bankId);
  }, [checkFilter, keys]);

  const [bankAccountIdSelect, setBankAccountIdSelect] = useState();

  //...........................................................................//

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const dataSource = dataSheetIntegration.map((item) => ({
    ...item,
    key: item.id,
  }));

  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleDeletes = async () => {
    setLoading(true);
    try {
      const idsToDelete = selectedRowKeys.map((key) => Number(key));
      const res = await deleteSheetIntergration(idsToDelete);

      if (!res || !res.success) {
        toast.error(res?.message);
      }
      else {
        toast.success("Xóa các mục thành công!");
        await setPageIndex(1);
        await setDataSheetIntegration([]);
        ClearFilter();

        fetchSheetIntegration();
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
          Danh sách tích hợp trang tính
        </div>
        <div className="flex justify-between items-center mb-7">
          <div>
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
                  await setDataSheetIntegration([])
                  filterBankAccount(value);
                  if (!value) {
                    handleSelectChange(sheetIdFilter, transTypeFilter, value);
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchSheetIntegration(
                      globalTerm,
                      sheetIdFilter,
                      transTypeFilter,
                      bankAccountId,
                      value,
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

                  setBankAccountId(parsedValue);

                  await setPageIndex(1);
                  await setDataSheetIntegration([])
                  await setBankAccountId(parsedValue);

                  fetchSheetIntegration(
                    globalTerm,
                    sheetIdFilter,
                    transTypeFilter,
                    parsedValue,
                    bankId,
                    1
                  );
                }}
                value={bankAccountId}
              />
              <CustomSelect
                mode="multiple"
                options={sheetFilter}
                placeholder="Nhóm trang tính"
                style={{ width: 245 }}
                allowClear
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
                onChange={async (value: any) => {
                  setSheetIdFilter(value);
                  await setPageIndex(1);
                  await setDataSheetIntegration([])
                  if (!value) {
                    handleSelectChange(
                      value,
                      transTypeFilter,
                      bankAccountId
                    );
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchSheetIntegration(
                      globalTerm,
                      value,
                      transTypeFilter,
                      bankAccountId,
                      bankId,
                      1
                    );
                  }
                }}
                value={sheetIdFilter}
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
                  await setDataSheetIntegration([])
                  if (!value) {
                    await setPageIndex(1);
                    await setDataSheetIntegration([])
                    handleSelectChange(sheetIdFilter, value, bankAccountId);
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchSheetIntegration(
                      globalTerm,
                      sheetIdFilter,
                      value,
                      bankAccountId,
                      bankId,
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
          currentSheet
            ? "Chỉnh sửa tích hợp trang tính"
            : "Thêm mới tích hợp trang tính"
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
            <Input hidden autoComplete="off" />
          </Form.Item>
          {currentSheet ? (
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
                onChange={(value) => {
                  setBankAccountIdSelect(value);
                }}
              />
            </Form.Item>
          ) : (
            <Form.Item
              label="Tài khoản ngân hàng"
              name="accountFullName"
              rules={[{ required: true, message: "Vui lòng chọn ngân hàng!" }]}
            >
              <Select
                allowClear
                placeholder="Chọn ngân hàng"
                onFocus={genBankData}
                options={banks}
                showSearch
                filterOption={(input, option) =>
                  option.label.toLowerCase().includes(input.toLowerCase())
                }
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
            label="Chọn nhóm trang tính"
            name="sheetName"
            rules={[
              { required: true, message: "Vui lòng chọn nhóm trang tính!" },
            ]}
          >
            <Select
              allowClear
              placeholder="Chọn nhóm trang tính"
              onFocus={genSheetData}
              options={sheet}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={async (value: any) => {
                const selectedGroup = await sheet.find(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (item: any) => item.value === value
                );
                if (selectedGroup) {
                  form.setFieldsValue({
                    sheetId: selectedGroup.sheetId,
                  });
                }
              }}
            />
          </Form.Item>
          <Form.Item hidden label="sheetId" name="sheetId">
            <Input autoComplete="off" />
          </Form.Item>
          <Form.Item hidden label="groupChatId" name="groupChatId">
            <Input hidden autoComplete="off" />
          </Form.Item>
          <Form.Item
            label="Chọn loại giao dịch"
            name="typeDescription"
            rules={[
              { required: true, message: "Vui lòng chọn loại tài khoản!" },
            ]}
          >
            <Select
              allowClear
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
              className={`${isAddSheetInter && "pointer-events-none"
                } bg-[#4B5CB8] border text-white font-medium w-[189px] !h-10`}
              loading={isAddSheetInter}
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
        handleDeleteSheetIntergration={selectedAccountGroup}
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

export default SheetIntergration;
