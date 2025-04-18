// ./src/components/HourlyTable.js
import React, { useMemo } from "react";
import { Table } from "antd";

function HourlyTable({
  selectedYears,
  selectedMeasures,
  hourlyStats,
}) {
  const dataSource = useMemo(() => {
    if (!hourlyStats || !Object.keys(hourlyStats).length) return [];

    const rows = [];
    selectedYears.forEach((year) => {
      const yearObj = hourlyStats[year] || {};
      selectedMeasures.forEach((col) => {
        const values = yearObj[col] || [];
        let sum = 0;
        let count = 0;
        const row = { key: `${year}-${col}`, year, category: col };

        for (let h = 0; h < 24; h++) {
          const val = values[h] ?? null;
          if (val == null) {
            row[`h${h}`] = "";
          } else {
            row[`h${h}`] = val.toFixed(2);
            sum += val;
            count++;
          }
        }
        if (count === 0) {
          row.hourlySum = "";
          row.hourlyAvg = "";
        } else {
          row.hourlySum = sum.toFixed(2);
          row.hourlyAvg = (sum / 24).toFixed(2);
        }
        rows.push(row);
      });
    });
    return rows;
  }, [hourlyStats, selectedYears, selectedMeasures]);

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
    const hourCols = Array.from({ length: 24 }, (_, h) => ({
      title: `${h}시`,
      dataIndex: `h${h}`,
      key: `h${h}`,
    }));

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
      ...hourCols,
      {
        title: "일간 합계",
        dataIndex: "hourlySum",
        key: "hourlySum",
        sorter: (a, b) => parseNumber(a.hourlySum) - parseNumber(b.hourlySum),
      },
      {
        title: "일간 평균",
        dataIndex: "hourlyAvg",
        key: "hourlyAvg",
        sorter: (a, b) => parseNumber(a.hourlyAvg) - parseNumber(b.hourlyAvg),
      },
    ];
  }, [yearFilterOptions, categoryFilterOptions]);

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
