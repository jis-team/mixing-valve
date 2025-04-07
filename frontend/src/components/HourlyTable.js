import React, { useMemo } from "react";
import { Table } from "antd";

function HourlyTable({ measureColumns, hourlyStats }) {
  const columns = useMemo(() => {
    const hourCols = Array.from({ length: 24 }, (_, idx) => ({
      title: `${idx}시`,
      dataIndex: `h${idx}`,
      key: `h${idx}`,
    }));

    return [
      {
        title: "항목",
        dataIndex: "category",
        key: "category",
        fixed: "left",
        filters: measureColumns.map(col => ({ text: col, value: col })),
        onFilter: (value, record) => record.category === value,
      },
      ...hourCols,
      {
        title: "일간 합계",
        dataIndex: "hourlySum",
        key: "hourlySum",
        sorter: (a, b) => parseFloat(a.hourlySum) - parseFloat(b.hourlySum),
      },
      {
        title: "일간 평균",
        dataIndex: "hourlyAvg",
        key: "hourlyAvg",
        sorter: (a, b) => parseFloat(a.hourlyAvg) - parseFloat(b.hourlyAvg),
      },
    ];
  }, [measureColumns]);

  const dataSource = useMemo(() => {
    if (!hourlyStats || !Object.keys(hourlyStats).length) return [];
    const rows = [];
    measureColumns.forEach(col => {
      const values = hourlyStats[col] || [];
      let sum = 0;
      const row = { key: col, category: col };

      for (let h = 0; h < 24; h++) {
        const val = values[h] || 0;
        row[`h${h}`] = val.toFixed(2);
        sum += val;
      }

      row.hourlySum = sum.toFixed(2);
      row.hourlyAvg = (sum / 24).toFixed(2);
      rows.push(row);
    });
    return rows;
  }, [hourlyStats, measureColumns]);

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

export default HourlyTable;
