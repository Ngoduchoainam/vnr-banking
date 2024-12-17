"use client";

import {
  Button,
  DatePicker,
  Form,
  Select,
  Skeleton,
  Table,
  Tooltip,
} from "antd";
import { useContext, useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { DeleteOutlined } from "@ant-design/icons";

import Header from "@/src/component/Header";
import ModalAddNew from "@/src/module/listTransaction/modalAddNew";
import { apiClient } from "@/src/services/base_api";
import { DeatailIcon } from "@/public/icon/detail";
import { DataDetail, DataTransactionType } from "@/src/common/type";
import { buildSearchParams, formatDate } from "@/src/utils/buildQueryParams";
import { RoleContext } from "@/src/component/RoleWapper";
import ModalDetail from "@/src/module/listTransaction/ModalDetail";
import DeleteModal from "@/src/component/config/modalDelete";
import { toast } from "react-toastify";

type DataTypeWithKey = DataTransactionType & { key: React.Key };

export interface TransactionFilter {
  label: string;
  key: string;
}

export interface ListOptionType {
  typeTransaction: TransactionFilter[];
  kindTransaction: TransactionFilter[];
}

const ListTransactionPage = () => {
  const { dataRole } = useContext(RoleContext);
  const keys = dataRole.key;
  const values = `${dataRole.value}`;

  const { RangePicker } = DatePicker;

  const [form] = Form.useForm();
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [dataTransaction, setDataTransaction] = useState<DataTransactionType[]>(
    []
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [listOption, setListOption] = useState<ListOptionType>({
    typeTransaction: [],
    kindTransaction: [],
  });

  const [dataFilter, setDataFilter] = useState({
    dataTypeTransaction: "",
    dataKindTransaction: "",
    startDate: "",
    endDate: "",
  });

  const [isShowDetail, setIsShowDetail] = useState(false);
  const [dataDetail, setDataDetail] = useState<DataDetail>();
  const [isShowModalDelete, setIsShowModalDelete] = useState(false);
  const [listItemDelete, setListItemDelete] = useState<number[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isDeleteOneItem, setIsDeleteOneItem] = useState(false);

  const getListTypeTransaction = async () => {
    const responsive = await apiClient.get("/allcode-api/find", {
      params: {
        cdType: "TRANSACTION",
        cdName: "TRANS_TYPE",
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataConvert = responsive.data.data.map((item: any) => {
      return { label: item.vnContent, value: item.cdVal };
    });
    setListOption((prev) => ({ ...prev, typeTransaction: dataConvert }));
  };

  const getListKindTransaction = async () => {
    const responsive = await apiClient.get("/allcode-api/find", {
      params: {
        cdType: "TRANSACTION",
        cdName: "TRANS_KIND",
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataConvert = responsive.data.data.map((item: any) => {
      return { label: item.vnContent, value: item.cdVal };
    });
    setListOption((prev) => ({ ...prev, kindTransaction: dataConvert }));
  };

  useEffect(() => {
    getListTypeTransaction();
    getListKindTransaction();
  }, []);

  const getDataDetail = async (id: number) => {
    try {
      const responsive = await apiClient.get("/asset-api/find-by-id", {
        params: {
          id: id,
        },
      });

      setDataDetail(responsive.data.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) { }
  };

  const deleleTransaction = async (id: number[]) => {
    try {
      const responsive = await apiClient.post("/asset-api/delete", id);
      if (responsive.data.success) {
        toast.success(responsive.data.message || "Xóa bản ghi thành công");
        await setPageIndex(1);;
        await setDataTransaction([])
        fetchData({});
      } else {
        toast.error(responsive.data.message || "Xảy ra lỗi");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
    } finally {
      setIsShowModalDelete(false);
    }
  };

  const handleDetail = (id: number) => {
    setIsShowDetail(true);
    getDataDetail(id);
  };

  const handleDelete = (id: number) => {
    setIsShowModalDelete(true);
    setIsDeleteOneItem(true);
    setListItemDelete((prev) => [...prev, id]);
  };

  const columns = [
    { title: "id", dataIndex: "id", key: "id", hidden: true },
    {
      title: "Người rút",
      dataIndex: "addedBy",
      key: "addedBy",
    },
    { title: "Người quản lý", dataIndex: "managerBy", key: "managerBy" },
    {
      title: "Ngày giao dịch",
      dataIndex: "transDate",
      key: "transDate",
      render: (date: string) => {
        // Định dạng lại chuỗi thời gian
        return dayjs(date).format("DD/MM/YYYY"); // Ví dụ định dạng ngày/tháng/năm giờ:phút:giây
      },
    },
    {
      title: "Giao dịch",
      dataIndex: "descriptionTransType",
      key: "descriptionTransType",
    },
    {
      title: "Bộ phận quản lý",
      dataIndex: "departmentManager",
      key: "departmentManager",
    },
    {
      title: "Chức năng",
      key: "action",
      render: (recode: DataTransactionType) => {
        return (
          <div className="flex items-center gap-6">
            <Tooltip placement="top" title="Chi tiết" className="z-[999]">
              <span>
                <DeatailIcon
                  onClick={() => handleDetail(recode.id)}
                  className="cursor-pointer"
                />
              </span>
            </Tooltip>
            <Button
              icon={<DeleteOutlined />}
              danger
              onClick={() => handleDelete(recode.id)}
            >
              Xóa
            </Button>
          </div>
        );
      },
    },
  ];

  const [pageIndex, setPageIndex] = useState(1);
  const [totalRecord, setTotalRecord] = useState(100);

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
    if (pageIndex > 1 && dataTransaction.length < totalRecord) {
      const scrollPositionBeforeFetch = window.scrollY;
      const previousDocumentHeight = document.documentElement.scrollHeight;

      fetchData({}).finally(() => {
        setTimeout(() => {
          const newDocumentHeight = document.documentElement.scrollHeight;
          const scrollDifference = newDocumentHeight - previousDocumentHeight;

          window.scrollTo(0, scrollPositionBeforeFetch + scrollDifference);
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

  const fetchData = async ({
    transType,
    transKind,
    startDate,
    endDate,
  }: {
    transType?: string;
    transKind?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const arr = [
      {
        Name: keys!,
        Value: values,
      },
    ];
    if (transType || dataFilter.dataTypeTransaction) {
      arr.push({
        Name: "transType",
        Value: transType ?? dataFilter.dataTypeTransaction,
      });
    }
    if (transKind || dataFilter.dataKindTransaction) {
      arr.push({
        Name: "transKind",
        Value: transKind ?? dataFilter.dataKindTransaction,
      });
    }

    if (
      (startDate && endDate) ||
      (dataFilter.startDate && dataFilter.endDate)
    ) {
      arr.push(
        {
          Name: "startDate",
          Value: startDate ?? dataFilter.startDate,
        },
        {
          Name: "endDate",
          Value: endDate ?? dataFilter.endDate,
        }
      );
    }

    const params = buildSearchParams(arr, {
      pageIndex: pageIndex,
      pageSize: 20,
    });

    try {
      setLoading(true);
      const responsive = await apiClient.get("/asset-api/find", { params });

      const dataTransactionConvert = responsive.data.data.source.map(
        (item: DataTransactionType) => {
          return { ...item, key: item.id };
        }
      );

      setTotalRecord(responsive?.data?.data.totalRecords || 0);
      setDataTransaction((prevData) => [...prevData, ...dataTransactionConvert]);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData({});
  }, []);

  const handleCancel = () => {
    setIsAddModalOpen((prev) => !prev);
  };

  const handleCancelDetail = () => {
    setIsShowDetail((prev) => !prev);
  };
  const handleCreateAdd = () => {
    form.resetFields();
    setIsAddModalOpen(true);
  };

  const handleChangeType = (e: string | undefined) => {
    setDataFilter((prev) => ({ ...prev, dataTypeTransaction: e ?? "" }));
    fetchData({
      transType: e ?? "",
    });
  };
  const handleChangeKind = (e: string | undefined) => {
    setDataFilter((prev) => ({ ...prev, dataKindTransaction: e ?? "" }));
    fetchData({
      transKind: e ?? "",
    });
  };

  const onRangeChange = async (
    dates: null | (Dayjs | null)[],
    dateStrings: string[]
  ) => {
    await setPageIndex(1);;
    await setDataTransaction([])
    setDataFilter((prev) => ({
      ...prev,
      startDate: dateStrings[0] ? formatDate(dateStrings[0]) : "",
      endDate: dateStrings[1] ? formatDate(dateStrings[1]) : "",
    }));
    if (dateStrings[0] && dateStrings[1]) {
      fetchData({
        startDate: dateStrings[0],
        endDate: dateStrings[1],
      });
    } else {
      fetchData({});
    }
  };

  const handleCancelDelete = () => {
    setIsShowModalDelete(false);
  };

  const handleConfirmDelete = () => {
    if (isDeleteOneItem) {
      deleleTransaction(listItemDelete);
    } else {
      const selectedRowKeysConvert = selectedRowKeys.map((key) => Number(key));
      deleleTransaction(selectedRowKeysConvert);
    }
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <>
      <Header />
      <div className="px-[30px]">
        <div className="text-[32px] font-bold py-5">Danh sách giao dịch</div>
        <div className="flex justify-between items-center mb-7">
          <div className="flex items-center gap-2">
            <Select
              placeholder="Loại giao dịch"
              style={{ width: 245 }}
              allowClear
              options={listOption.typeTransaction}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={async (e) => {
                await setPageIndex(1);;
                await setDataTransaction([])
                handleChangeType(e)
              }}
            />
            <Select
              placeholder="Kiểu giao dịch"
              style={{ width: 245 }}
              allowClear
              options={listOption.kindTransaction}
              showSearch
              filterOption={(input, option) =>
                option.label.toLowerCase().includes(input.toLowerCase())
              }
              onChange={async (e) => {
                await setPageIndex(1);;
                await setDataTransaction([])
                handleChangeKind(e)
              }}
            />
            <RangePicker
              id={{
                start: "startInput",
                end: "endInput",
              }}
              onChange={onRangeChange}
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />
          </div>
          <div className="flex items-center gap-2">
            {selectedRowKeys.length > 0 && dataTransaction.length > 0 && (
              <Button
                className="bg-[#4B5CB8] w-[136px] !h-10 text-white font-medium hover:bg-[#3A4A9D]"
                onClick={() => {
                  setIsShowModalDelete(true);
                  setIsDeleteOneItem(false);
                }}
              >
                Xóa nhiều
              </Button>
            )}
            <Button
              className="bg-[#4B5CB8] w-[136px] !h-10 text-white font-medium hover:bg-[#3A4A9D]"
              onClick={() => {
                handleCreateAdd();
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
            dataSource={dataTransaction}
            columns={columns}
            rowSelection={rowSelection}
            pagination={false}
          />
        )}
      </div>

      <ModalAddNew
        isAddModalOpen={isAddModalOpen}
        onCancel={handleCancel}
        fetchData={async () => {
          await setPageIndex(1);
          await setDataTransaction([]);
          fetchData({});
        }}
      />

      <ModalDetail
        isShowDetail={isShowDetail}
        onCancel={handleCancelDetail}
        dataDetail={dataDetail}
      />

      <DeleteModal
        open={isShowModalDelete}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};

export default ListTransactionPage;
