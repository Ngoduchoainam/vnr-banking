"use client";

import React, { useState, useEffect } from "react";
import { Button, Table } from "antd";
import { getAccountGroup } from "@/src/services/accountGroup";
import InfiniteScroll from "react-infinite-scroll-component";
// import { useFilter } from "@/src/utils/handleChange";
// import { getListTelegram } from "@/src/services/telegram";
// import { fetchBankAccounts } from "@/src/services/bankAccount";

interface DataType {
  id: string;
  fullName: string;
  notes: string;
}

// const { Option } = Select;

const FilterComponent: React.FC = () => {
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageIndex, setPageIndex] = useState(1);
  const pageSize = 15;
  const [hasMore, setHasMore] = useState(true);

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const response = await getAccountGroup(page, pageSize);
      const formattedData = response?.data?.source?.map((item: DataType) => ({
        key: item.id,
        fullName: item.fullName,
        notes: item.notes || "",
      }));

      setData((prevData) => [...prevData, ...formattedData]);

      if (formattedData.length < pageSize) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(pageIndex);
  }, [pageIndex]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEdit = (key: string) => {
    // Thêm logic chỉnh sửa
  };

  const handleDelete = (key: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setData((prevData) => prevData.filter((item: any) => item.key !== key));
    // Thêm logic gọi API xóa dữ liệu
  };

  const loadMoreData = () => {
    if (!loading && hasMore) {
      setPageIndex((prev) => prev + 1);
    }
  };

  const columns = [
    {
      title: "Tên nhóm tài khoản",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Ghi chú",
      dataIndex: "notes",
      key: "notes",
    },
    {
      title: "Chức năng",
      key: "actions",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (_: any, record: any) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button onClick={() => handleEdit(record.key)}>Chỉnh sửa</Button>
          <Button danger onClick={() => handleDelete(record.key)}>
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div>
        <InfiniteScroll
          dataLength={data.length}
          next={loadMoreData}
          hasMore={hasMore}
          loader={<div>Đang tải dữ liệu...</div>}
          scrollThreshold={0.9}
          scrollableTarget="table-scroll-container"
        >
          <Table
            columns={columns}
            dataSource={data}
            pagination={false}
            loading={loading}
            bordered
            rowSelection={{ type: "checkbox" }}
            scroll={{ x: true }}
            style={{ width: "100%" }}
          />
        </InfiniteScroll>
      </div>
    </>
  );
};

export default FilterComponent;

// const { handleChange } = useFilter();
// const [globalTerm, setGlobalTerm] = useState<string>('');
// const [teleGroupChatFilter, setTeleGroupChatFilter] = useState<
//   { value: string; label: string }[]
// >([]);
// const [bankFilter, setBankFilter] = useState<
//   { value: string; label: string }[]
// >([]);

// const handleFilterGroupChat = async () => {
//   try {
//     const { data } = await getListTelegram(1, 20);
//     const res =
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       data?.source?.map((x: any) => ({
//         value: x.id,
//         label: x.name || "Không xác định",
//       })) || [];
//     setTeleGroupChatFilter(res);
//   } catch (error) {
//     console.error("Lỗi khi lấy nhóm chat Telegram:", error);
//   }
// };

// const bankAccountFilterAPI = async () => {
//   try {
//     const { data } = await fetchBankAccounts(1, 20);
//     const res =
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       data?.source?.map((bank: any) => ({
//         value: bank.id,
//         label: bank.bank.code,
//       })) || [];
//     setBankFilter(res);
//   } catch (error) {
//     console.error("Lỗi khi lấy danh sách ngân hàng:", error);
//   }
// };

// useEffect(() => {
//   Promise.all([handleFilterGroupChat(), bankAccountFilterAPI()]);
// }, []);

// const handleSearch = (value: string) => {
//   setGlobalTerm(value);
//   const params = {
//     pageIndex: 1,
//     pageSize: 20,
//     globalTerm: value,
//   };
//   console.log(params);
//   // Ở đây có thể gọi API với params nếu cần
//   // apiCall(params);
// };

{
  /* <div>
  <Input
  placeholder="Tìm kiếm toàn cầu ..."
  style={{
    width: 253,
    borderRadius: 10,
    height: 38,
    marginRight: 15,
    }}
    value={globalTerm}
    onChange={(e) => {
      const value = e.target.value;
      setGlobalTerm(value);
    }}
    onPressEnter={async (e) => {
      handleSearch(e.currentTarget.value);
    }}
  />
</div>
<div>
  <Select
    allowClear
    mode="multiple"
    placeholder="Chọn danh mục"
    style={{ width: 200, marginRight: 10 }}
    onChange={(value) => handleChange(value, "category")}
  >
    <Option value="electronics">Điện tử</Option>
    <Option value="fashion">Thời trang</Option>
    <Option value="books">Sách</Option>
  </Select>
</div>
<div>
  <Select
    allowClear
    placeholder="Chọn nhóm chat Telegram"
    style={{ width: 200, marginTop: 10 }}
    onChange={(value) => handleChange(value, "groupChatId")}
    options={teleGroupChatFilter}
  />
</div>
<div>
  <Select
    mode="multiple"
    allowClear
    placeholder="Chọn ngân hàng"
    style={{ width: 200, marginTop: 10 }}
    onChange={(value) => handleChange(value, "bankAccountId")}
    options={bankFilter}
  />
</div> */
}
