import React from "react";
import { Table, Skeleton } from "antd";

interface LoadingTableProps {
    loading: boolean;
    pageIndex: number;
    dataSource: any[];
    columns: any[];
}

const LoadingTable = ({
    loading,
    pageIndex,
    dataSource,
    columns,
}: LoadingTableProps) => {
    if (loading) {
        if (pageIndex === 1) {
            // Bảng "ảo" với các dòng trống khi pageIndex = 1
            return (
                <Table
                    rowKey="key"
                    pagination={false}
                    loading={loading}
                    dataSource={([...Array(10)]).map((_, index) => ({
                        key: `key${index}`,
                    }))}
                    columns={columns.map((column) => ({
                        ...column,
                        render: function renderPlaceholder() {
                            return (
                                <Skeleton key={column.key as React.Key} title active={false} paragraph={false} />
                            );
                        },
                    }))}
                />
            );
        }
    }

    // Khi không còn loading, hiển thị bảng với dữ liệu thực tế
    return <Table dataSource={dataSource} columns={columns} pagination={false} />;
};

export default LoadingTable;
