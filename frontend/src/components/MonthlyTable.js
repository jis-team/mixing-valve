import React, { useMemo } from "react";
import { Table } from "antd";

function MonthlyTable({ measureColumns, monthlyStats, onMonthClick }) {
  // 테이블 컬럼
  const columns = useMemo(() => {
    // 1~12월
    const monthCols = Array.from({ length: 12 }, (_, idx) => {
      const m = idx + 1;
      return {
        title: `${m}월`,
        dataIndex: `m${m}`,
        key: `m${m}`,
        onHeaderCell: () => ({
          style: { cursor: "pointer" },
          onClick: () => onMonthClick?.(m),
        }),
      };
    });

    return [
      {
        title: "항목",
        dataIndex: "category",
        key: "category",
        fixed: "left",
        filters: measureColumns.map(col => ({ text: col, value: col })),
        onFilter: (value, record) => record.category === value,
      },
      ...monthCols,
      {
        title: "연간 합계",
        dataIndex: "yearSum",
        key: "yearSum",
        sorter: (a, b) => parseFloat(a.yearSum) - parseFloat(b.yearSum),
      },
      {
        title: "연간 평균",
        dataIndex: "yearAvg",
        key: "yearAvg",
        sorter: (a, b) => parseFloat(a.yearAvg) - parseFloat(b.yearAvg),
      },
    ];
  }, [measureColumns, onMonthClick]);

  // 테이블 데이터
  const dataSource = useMemo(() => {
    if (!monthlyStats || !Object.keys(monthlyStats).length) return [];
    const rows = [];
    measureColumns.forEach(col => {
      const values = monthlyStats[col] || [];
      let sum = 0;
      const row = { key: col, category: col };

      values.forEach((val, idx) => {
        row[`m${idx + 1}`] = val.toFixed(2);
        sum += val;
      });

      row.yearSum = sum.toFixed(2);
      row.yearAvg = (sum / 12).toFixed(2);
      rows.push(row);
    });
    return rows;
  }, [monthlyStats, measureColumns]);

  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      pagination={false}
      bordered
      scroll={{ x: "max-content" }}
    />
  );
}

export default MonthlyTable;
