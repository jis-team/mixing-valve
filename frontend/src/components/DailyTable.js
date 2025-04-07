// DailyTable.js
import React, { useMemo } from "react";
import { Table } from "antd";

function DailyTable({ 
    selectedYears, 
    selectedMeasures, 
    dailyStats, 
    dayCount, 
    onDayClick 
}) {
  // 1) 1~31일 컬럼
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
        title: "연도",
        dataIndex: "year",
        key: "year",
        fixed: "left",
        width: 80,
      },
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

  // 2) dataSource: (연도)×(항목)
  const dataSource = useMemo(() => {
    if (!dailyStats || !Object.keys(dailyStats).length) return [];

    const rows = [];
    selectedYears.forEach(year => {
      const yearObj = dailyStats[year] || {};
      // yearObj[colA] = [31], yearObj[colB] = [31], ...

      selectedMeasures.forEach(col => {
        const values = yearObj[col] || [];
        let sum = 0;
        const row = {
          key: `${year}-${col}`,
          year,
          category: col,
        };

        for (let i = 0; i < dayCount; i++) {
          const val = values[i] || 0;
          row[`d${i + 1}`] = val.toFixed(2);
          sum += val;
        }
        row.monthlySum = sum.toFixed(2);
        row.monthlyAvg = dayCount > 0 ? (sum / dayCount).toFixed(2) : "0.00";

        rows.push(row);
      });
    });

    return rows;
  }, [dailyStats, dayCount, selectedMeasures, selectedYears]);

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
