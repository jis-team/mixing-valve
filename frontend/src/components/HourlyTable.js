// HourlyTable.js
import React, { useMemo } from "react";
import { Table } from "antd";

function HourlyTable({ selectedYears, selectedMeasures, hourlyStats }) {
  // 1) 0~23시 컬럼
  const columns = useMemo(() => {
    const hourCols = Array.from({ length: 24 }, (_, idx) => ({
      title: `${idx}시`,
      dataIndex: `h${idx}`,
      key: `h${idx}`,
    }));

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
      ...hourCols,
      {
        title: "일간 합계",
        dataIndex: "hourlySum",
        key: "hourlySum",
      },
      {
        title: "일간 평균",
        dataIndex: "hourlyAvg",
        key: "hourlyAvg",
      },
    ];
  }, []);

  // 2) dataSource: (연도)×(항목)
  const dataSource = useMemo(() => {
    if (!hourlyStats || !Object.keys(hourlyStats).length) return [];

    const rows = [];
    selectedYears.forEach(year => {
      const yearObj = hourlyStats[year] || {};
      // yearObj[colA] = [24], yearObj[colB] = [24], ...

      selectedMeasures.forEach(col => {
        const values = yearObj[col] || [];
        let sum = 0;
        const row = {
          key: `${year}-${col}`,
          year,
          category: col,
        };

        for (let h = 0; h < 24; h++) {
          const val = values[h] || 0;
          row[`h${h}`] = val.toFixed(2);
          sum += val;
        }
        row.hourlySum = sum.toFixed(2);
        row.hourlyAvg = (sum / 24).toFixed(2);

        rows.push(row);
      });
    });

    return rows;
  }, [hourlyStats, selectedMeasures, selectedYears]);

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
