// ./src/components/DailyTable.js
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
        let count = 0;
        const row = {
          key: `${year}-${col}`,
          year,
          category: col,
        };

        values.forEach((val, idx) => {
          if (val === null) {
            row[`d${idx + 1}`] = "";
          } else {
            row[`d${idx + 1}`] = val.toFixed(2);
            sum += val;
            count += 1;
          }
        });

        if (count === 0) {
          row.monthlySum = "";
          row.monthlyAvg = "";
        } else {
          row.monthlySum = sum.toFixed(2);
          // 12개월 중 count개만 데이터가 있더라도, 기존 로직대로 "연간합 / 12" 인지,
          // 실제 (sum / count) 인지 정책 결정. 여기서는 sum/12 유지
          row.monthlyAvg = dayCount > 0 ? (sum / dayCount).toFixed(2) : "";
        }

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
