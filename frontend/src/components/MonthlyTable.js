// ./src/components/MonthlyTable.js
import React, { useMemo } from "react";
import { Table } from "antd";

function MonthlyTable({ 
  selectedYears, 
  selectedMeasures, 
  monthlyStats, 
  onMonthClick 
}) {
  const dataSource = useMemo(() => {
    if (!monthlyStats || !Object.keys(monthlyStats).length) return [];

    const rows = [];
    selectedYears.forEach(year => {
      const yearObj = monthlyStats[year] || {};
      selectedMeasures.forEach(col => {
        const values = yearObj[col] || [];
        let sum = 0;
        let count = 0;
        const row = { key: `${year}-${col}`, year, category: col };
        
        values.forEach((val, idx) => {
          if (val === null) {
            row[`m${idx + 1}`] = "";
          } else {
            row[`m${idx + 1}`] = val.toFixed(2);
            sum += val;
            count += 1;
          }
        });

        if (count === 0) {
          row.yearSum = "";
          row.yearAvg = "";
        } else {
          row.yearSum = sum.toFixed(2);
          row.yearAvg = (sum / 12).toFixed(2);
        }

        rows.push(row);
      });
    });

    return rows;
  }, [monthlyStats, selectedMeasures, selectedYears]);

  const yearFilterOptions = useMemo(() => {
    const yearSet = new Set(dataSource.map((row) => row.year));
    return Array.from(yearSet).map((y) => ({ text: y, value: y }));
  }, [dataSource]);

  const categoryFilterOptions = useMemo(() => {
    const catSet = new Set(dataSource.map((row) => row.category));
    return Array.from(catSet).map((c) => ({ text: c, value: c }));
  }, [dataSource]);

  function parseNumber(value) {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  }

  const columns = useMemo(() => {
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
        title: "연도",
        dataIndex: "year",
        key: "year",
        fixed: "left",
        width: 80,
        filters: yearFilterOptions,
        onFilter: (value, record) => record.year === value,
      },
      {
        title: "항목",
        dataIndex: "category",
        key: "category",
        fixed: "left",
        filters: categoryFilterOptions,
        onFilter: (value, record) => record.category === value,
      },
      ...monthCols,
      {
        title: "연간 합계",
        dataIndex: "yearSum",
        key: "yearSum",
        sorter: (a, b) => parseNumber(a.yearSum) - parseNumber(b.yearSum),
      },
      {
        title: "연간 평균",
        dataIndex: "yearAvg",
        key: "yearAvg",
        sorter: (a, b) => parseNumber(a.yearAvg) - parseNumber(b.yearAvg),
      },
    ];
  }, [onMonthClick, yearFilterOptions, categoryFilterOptions]);

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
