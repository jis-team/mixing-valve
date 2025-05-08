// ./src/components/tables/DailyTable.js
import React, { useMemo } from "react";
import { Table } from "antd";

/**
 * @param {string}   selectYear        - 연도
 * @param {number}   selectMonth       - 월 (1~12)
 * @param {string[]} subTags
 * @param {Object[]} dayStats          - dummy_data_day_stats에서 가져온 통계 배열
 * @param {Object[]} monthStats        - dummy_data_month_stats (월간 합계/평균용)
 * @param {number}   dayCount          - 해당 월의 일수 (예: 31)
 * @param {string}   calcMode          - "sum" | "avg"
 * @param {function} onDayClick        - (day: number) => void
 */
function DailyTable({
  selectYear,
  selectMonth,
  subTags,
  dayStats,
  monthStats = [],
  dayCount,
  calcMode,
  onDayClick,
}) {
  /**
   * dayStats 예: 
   * [
   *   { tag: "에너지사용량", datetime: "2023-05-01", sum: 100, avg: 4.16 },
   *   { tag: "에너지사용량", datetime: "2023-05-02", sum: 150, avg: 6.25 },
   *   ...
   * ]
   * 해당 year, month 데이터라고 가정
   */

  // (연도-월) 문자열
  const yyyymm = `${selectYear}-${String(selectMonth).padStart(2, "0")}`;

  // 월간 합계/평균도 표기하기 위해, monthStats에서 tag별로 찾는다.
  // monthStats 구조:
  // [
  //   { tag: "에너지사용량", datetime: "2023-05", sum: 1234.56, avg: 12.34 },
  //   ...
  // ]
  const monthStatsMap = useMemo(() => {
    const map = {};
    monthStats.forEach((row) => {
      if (row.datetime === yyyymm) {
        map[row.tag] = row; // tag로 매핑
      }
    });
    return map;
  }, [monthStats, yyyymm]);

  // 일별(pivot) 계산
  const pivotResult = useMemo(() => {
    // result[tag] = [ day1, day2, ..., day31 ]
    const result = {};
    subTags.forEach((tag) => {
      result[tag] = Array(dayCount).fill(null);
    });

    dayStats.forEach((row) => {
      const { tag, datetime } = row;
      if (!subTags.includes(tag)) return;

      // "2023-05-01" -> day = 1
      const parts = datetime.split("-");
      if (parts.length !== 3) return;
      const d = Number(parts[2]);

      if (d >= 1 && d <= dayCount) {
        result[tag][d - 1] = row[calcMode]; // sum or avg
      }
    });

    return result;
  }, [subTags, dayStats, calcMode, dayCount]);

  // 테이블 dataSource
  const dataSource = useMemo(() => {
    const rows = [];

    subTags.forEach((tag) => {
      const values = pivotResult[tag];
      const row = {
        key: `${tag}`,
        category: tag,
      };

      // d1 ~ dN
      values.forEach((val, idx) => {
        row[`d${idx + 1}`] = val == null ? "" : val.toFixed(2);
      });

      // 월간 합계/평균
      const mRow = monthStatsMap[tag];
      if (mRow) {
        row.monthlySum = mRow.sum == null ? "" : mRow.sum.toFixed(2);
        row.monthlyAvg = mRow.avg == null ? "" : mRow.avg.toFixed(2);
      } else {
        row.monthlySum = "";
        row.monthlyAvg = "";
      }
      rows.push(row);
    });

    return rows;
  }, [subTags, pivotResult, monthStatsMap, dayCount]);

  // 테이블 columns
  const columns = useMemo(() => {
    const dayCols = Array.from({ length: dayCount }, (_, idx) => {
      const d = idx + 1;
      return {
        title: `${d}일`,
        dataIndex: `d${d}`,
        key: `d${d}`,
        onCell: () => ({
          onClick: () => onDayClick?.(d),
          style: { cursor: onDayClick ? "pointer" : "auto" },
        }),
      };
    });

    return [
      {
        title: "항목",
        dataIndex: "category",
        key: "category",
        fixed: "left",
        width: 150,
      },
      ...dayCols,
      {
        title: "월간 합계",
        dataIndex: "monthlySum",
        key: "monthlySum",
        sorter: (a, b) => parseFloat(a.monthlySum) - parseFloat(b.monthlySum),
      },
      {
        title: "월간 평균",
        dataIndex: "monthlyAvg",
        key: "monthlyAvg",
        sorter: (a, b) => parseFloat(a.monthlyAvg) - parseFloat(b.monthlyAvg),
      },
    ];
  }, [dayCount, onDayClick]);

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
