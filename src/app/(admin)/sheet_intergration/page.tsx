"use client";

import React, { useContext, useEffect, useState } from "react";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Header from "@/src/component/Header";
import { Button, Form, Input, Select, Skeleton, Space, Table } from "antd";
import {
  addSheetIntergration,
  deleteSheetIntergration,
  getListSheetIntergration,
  getTransTypeSheet,
} from "@/src/services/sheet_intergration";
import BaseModal from "@/src/component/config/BaseModal";
import { fetchBankAccounts } from "@/src/services/bankAccount";
import { getListSheet } from "@/src/services/sheet";
import DeleteModal from "@/src/component/config/modalDelete";
import { toast } from "react-toastify";
import { RoleContext } from "@/src/component/RoleWapper";

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

type DataTypeWithKey = ListSheetIntegration & { key: React.Key };

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
  const [banks, setBanks] = useState<Array<ListSheetIntegration>>([]);
  const [sheet, setSheet] = useState<Array<ListSheetIntegration>>([]);
  const [isAddSheetInter, setIsAddSheetInter] = useState<boolean>(false);

  const fetchSheetIntegration = async (
    globalTerm?: string,
    sheetId?: string,
    transType?: string,
    bankAccount?: string
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

    arrSheet.push({
      Name: keys!,
      Value: values,
    });
    addedParams.add(keys!);
    setLoading(true);
    try {
      const response = await getListSheetIntergration(
        pageIndex,
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
      setDataSheetIntegration(formattedData);
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSheetIntegration(globalTerm);
  }, [globalTerm]);

  const genBankData = async () => {
    try {
      const bankData = await fetchBankAccounts(1, 50);
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
      const dataTelegram = await getListSheet(1, 50);
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

  const [transType, setTransType] = useState<Array<ListSheetIntegration>>([]);

  const genTransTypes = async (
    bankAccountId: number,
    sheetId: number,
    id?: number
  ) => {
    try {
      const dataTransType = await getTransTypeSheet(bankAccountId, sheetId, id);
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
      await fetchSheetIntegration();
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

  const handleSearch = async (value: string) => {
    setGlobalTerm(value);
    try {
      if (value.trim() === "") {
        const data = await getListSheetIntergration(1, 20);
        const formattedData =
          data?.data?.source?.map((x: ListSheetIntegration) => ({
            id: x.id?.toString() || Date.now().toString(), // id
            code: x.code, // Mã ngân hàng
            accountNumber: x.accountNumber, // stk
            fullName: x.fullName, // tên chủ tk
            linkUrl: x.linkUrl, // link url
            transType: x.transType, // status loại giao dịch
            bankAccountId: x.bankAccountId,
            sheetId: x.sheetId, // id của sheet
          })) || [];

        setDataSheetIntegration(formattedData);
      } else {
        const data = await getListSheetIntergration(1, 20, value);
        const formattedData =
          data?.data?.source?.map((x: ListSheetIntegration) => ({
            id: x.id?.toString() || Date.now().toString(), // id
            code: x.code, // Mã ngân hàng
            accountNumber: x.accountNumber, // stk
            fullName: x.fullName, // tên chủ tk
            linkUrl: x.linkUrl, // link url
            transType: x.transType, // status loại giao dịch
            bankAccountId: x.bankAccountId,
            sheetId: x.sheetId, // id của sheet
          })) || [];

        setDataSheetIntegration(formattedData);
      }
    } catch (error) {
      console.error("Lỗi khi tìm kiếm tài khoản ngân hàng:", error);
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
      bankAccountId: bankAccount,
    }));
  };
  const [pageIndex] = useState(1);
  const [pageSize] = useState(50);

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

  const bankAccountFilterAPI = async (bankAccount?: string) => {
    const arr: FilterSheetIntergration[] = [];
    const bankAccountFilter: FilterSheetIntergration = {
      Name: "bankAccountId",
      Value: bankAccount!,
    };
    const obj: FilterSheetIntergration = {
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
      await handleFilterSheet();
      await bankAccountFilterAPI();
    };

    fetchData();
  }, [filterParams]);

  const [checkFilter, setCheckFilter] = useState(false);
  useEffect(() => {
    fetchSheetIntegration(sheetIdFilter);
  }, [checkFilter]);

  useEffect(() => {
    fetchSheetIntegration();
  }, [keys]);

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
      await deleteSheetIntergration(idsToDelete);
      toast.success("Xóa các mục thành công!");
      await fetchSheetIntegration();
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
          Danh sách tích hợp trang tính
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
                handleSearch(value);
              }}
              onPressEnter={async (e) => {
                handleSearch(e.currentTarget.value);
              }}
            />
            <Space direction="horizontal" size="middle">
              <Select
                mode="multiple"
                options={sheetFilter}
                placeholder="Nhóm trang tính"
                style={{ width: 245 }}
                allowClear
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                onChange={(value: any) => {
                  setSheetIdFilter(value);
                  if (!value) {
                    handleSelectChange(
                      value,
                      transTypeFilter,
                      bankAccountFilter
                    );
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchSheetIntegration(
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
                    handleSelectChange(sheetIdFilter, value, bankAccountFilter);
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchSheetIntegration(
                      globalTerm,
                      sheetIdFilter,
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
                    handleSelectChange(sheetIdFilter, transTypeFilter, value);
                    setCheckFilter(!checkFilter);
                  } else {
                    fetchSheetIntegration(
                      globalTerm,
                      sheetIdFilter,
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
                setCurrentSheet(null);
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onFocus={() => {
                const formData = form.getFieldsValue();
                genTransTypes(
                  formData.bankAccountId,
                  formData.sheetId,
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
              className={`${
                isAddSheetInter && "pointer-events-none"
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
