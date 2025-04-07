import React, { useMemo } from "react";
import { Table } from "antd";

function DailyTable({ measureColumns, dailyStats, dayCount, onDayClick }) {
  const columns = useMemo(() => {
    if (!dayCount) return [];
    const dayCols = Array.from({ length: dayCount }, (_, idx) => {
      const d = idx + 1;
      return {
        title: `${d}일`,
        dataIndex: `d${d}`,
        key: `d${d}`,
        onHeaderCell: () => ({
          style: { cursor: "pointer" },
          onClick: () => onDayClick?.(d),
        }),
      };
    });

    return [
      {
        title: "항목",
        dataIndex: "category",
        key: "category",
        fixed: "left",
      },
      ...dayCols,
      {
        title: "월간 합계",
        dataIndex: "monthlySum",
        key: "monthlySum",
      },
      {
        title: "월간 평균",
        dataIndex: "monthlyAvg",
        key: "monthlyAvg",
      },
    ];
  }, [dayCount, onDayClick]);

  const dataSource = useMemo(() => {
    if (!dailyStats || !Object.keys(dailyStats).length) return [];
    const rows = [];
    measureColumns.forEach(col => {
      const values = dailyStats[col] || [];
      let sum = 0;
      const row = { key: col, category: col };

      for (let i = 0; i < dayCount; i++) {
        const val = values[i] || 0;
        row[`d${i + 1}`] = val.toFixed(2);
        sum += val;
      }

      row.monthlySum = sum.toFixed(2);
      row.monthlyAvg = (sum / dayCount).toFixed(2);
      rows.push(row);
    });
    return rows;
  }, [dailyStats, dayCount, measureColumns]);

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

export default DailyTable;
