// ./src/components/DailyTable.js
import React, { useMemo } from "react";
import { Table } from "antd";

function DailyTable({
  selectedYears,
  selectedMeasures,
  dailyStats,
  dayCount,
  onDayClick,
}) {
  const dataSource = useMemo(() => {
    if (!dailyStats || !Object.keys(dailyStats).length) return [];

    const rows = [];
    selectedYears.forEach((year) => {
      const yearObj = dailyStats[year] || {};
      selectedMeasures.forEach((col) => {
        const values = yearObj[col] || [];
        let sum = 0;
        let count = 0;
        const row = { key: `${year}-${col}`, year, category: col };

        for (let i = 0; i < dayCount; i++) {
          const val = values[i] ?? null;
          if (val == null) {
            row[`d${i + 1}`] = "";
          } else {
            row[`d${i + 1}`] = val.toFixed(2);
            sum += val;
            count++;
          }
        }
        if (count === 0) {
          row.monthlySum = "";
          row.monthlyAvg = "";
        } else {
          row.monthlySum = sum.toFixed(2);
          row.monthlyAvg = (sum / dayCount).toFixed(2);
        }
        rows.push(row);
      });
    });
    return rows;
  }, [dailyStats, dayCount, selectedYears, selectedMeasures]);

  const yearFilterOptions = useMemo(() => {
    const setY = new Set(dataSource.map((r) => r.year));
    return Array.from(setY).map((y) => ({ text: y, value: y }));
  }, [dataSource]);

  const categoryFilterOptions = useMemo(() => {
    const setC = new Set(dataSource.map((r) => r.category));
    return Array.from(setC).map((c) => ({ text: c, value: c }));
  }, [dataSource]);

  function parseNumber(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  const columns = useMemo(() => {
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
        filters: yearFilterOptions,
        onFilter: (val, rec) => rec.year === val,
      },
      {
        title: "항목",
        dataIndex: "category",
        key: "category",
        fixed: "left",
        width: 120,
        filters: categoryFilterOptions,
        onFilter: (val, rec) => rec.category === val,
      },
      ...dayCols,
      { 
        title: "월간 합계", 
        dataIndex: "monthlySum", 
        key: "monthlySum",
        sorter: (a, b) => parseNumber(a.monthlySum) - parseNumber(b.monthlySum), 
      },
      { 
        title: "월간 평균",
        dataIndex: "monthlyAvg", 
        key: "monthlyAvg",
        sorter: (a, b) => parseNumber(a.monthlyAvg) - parseNumber(b.monthlyAvg), 
      },
    ];
  }, [dayCount, onDayClick, yearFilterOptions, categoryFilterOptions]);

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
