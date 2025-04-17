// ./src/components/MonthlyTable.js
import React, { useMemo } from "react";
import { Table } from "antd";

function MonthlyTable({ 
  selectedYears, 
  selectedMeasures, 
  monthlyStats, 
  onMonthClick 
}) {
  // 1) "1~12월" 컬럼
  const columns = useMemo(() => {
    const monthCols = Array.from({ length: 12 }, (_, idx) => {
      const m = idx + 1;
      return {
        title: `${m}월`,
        dataIndex: `m${m}`,
        key: `m${m}`,
        onHeaderCell: () => ({
          style: { cursor: "pointer" },
          onClick: () => onMonthClick?.(m), // 월 클릭 시 하위 일별 통계로 drill-down
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
      ...monthCols,
      {
        title: "연간 합계",
        dataIndex: "yearSum",
        key: "yearSum",
      },
      {
        title: "연간 평균",
        dataIndex: "yearAvg",
        key: "yearAvg",
      },
    ];
  }, [onMonthClick]);

  // 2) dataSource: (연도)×(항목)
  const dataSource = useMemo(() => {
    if (!monthlyStats || !Object.keys(monthlyStats).length) return [];

    const rows = [];
    selectedYears.forEach(year => {
      const yearObj = monthlyStats[year] || {};
      // yearObj[colA] = [12], yearObj[colB] = [12], ...

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
          // 12개월 중 count개만 데이터가 있더라도, 기존 로직대로 "연간합 / 12" 인지,
          // 실제 (sum / count) 인지 정책 결정. 여기서는 sum/12 유지
          row.yearAvg = (sum / 12).toFixed(2);
        }

        rows.push(row);
      });
    });

    return rows;
  }, [monthlyStats, selectedMeasures, selectedYears]);

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
