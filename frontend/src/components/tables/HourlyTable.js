// ./src/components/tables/HourlyTable.js
import React, { useMemo } from "react";
import { Table } from "antd";

/**
 * @param {string}   selectYear
 * @param {number}   selectMonth
 * @param {number}   selectDay
 * @param {string[]} subTags
 * @param {Object[]} hourStats   - dummy_data_hour_stats에서 가져온 통계 배열
 * @param {Object[]} dayStats    - dummy_data_day_stats (일간 합계/평균용)
 * @param {string}   calcMode    - "sum" or "avg"
 * @param {function} onHourClick
 */
function HourlyTable({
  selectYear,
  selectMonth,
  selectDay,
  subTags,
  hourStats,
  dayStats = [],
  calcMode,
  onHourClick,
}) {
  /**
   * hourStats 예:
   * [
   *   { tag: "에너지사용량", datetime: "2023-05-02 00", sum: 10, avg: 10 },
   *   { tag: "에너지사용량", datetime: "2023-05-02 01", sum: 12, avg: 12 },
   *   ...
   * ]
   */

  // "2023-05-02"
  const yyyymmdd = `${selectYear}-${String(selectMonth).padStart(2, "0")}-${String(selectDay).padStart(2, "0")}`;

  // 일간 합계/평균 표기를 위해, dayStats에서 같은 날짜 + 같은 tag를 찾아 사용
  // dayStats = [ { tag, datetime: "2023-05-02", sum, avg }, ...]
  const dayStatsMap = useMemo(() => {
    const map = {};
    dayStats.forEach((row) => {
      if (row.datetime === yyyymmdd) {
        map[row.tag] = row; // tag 단위 매핑
      }
    });
    return map;
  }, [dayStats, yyyymmdd]);

  // 시간별 pivot
  const pivotResult = useMemo(() => {
    // result[tag] = [ h0, h1, ..., h23 ]
    const result = {};
    subTags.forEach((tag) => {
      result[tag] = Array(24).fill(null);
    });

    hourStats.forEach((row) => {
      const { tag, datetime } = row;
      if (!subTags.includes(tag)) return;

      // datetime: "2023-05-02 03" -> hour=3
      const parts = datetime.split(" ");
      if (parts.length !== 2) return;
      const hourStr = parts[1]; // "03"
      const h = Number(hourStr);
      if (!Number.isNaN(h) && h >= 0 && h <= 23) {
        result[tag][h] = row[calcMode]; // sum or avg
      }
    });

    return result;
  }, [subTags, hourStats, calcMode]);

  // 테이블 dataSource
  const dataSource = useMemo(() => {
    const rows = [];

    subTags.forEach((tag) => {
      const values = pivotResult[tag];
      const row = {
        key: tag,
        category: tag,
      };

      for (let h = 0; h < 24; h++) {
        const val = values[h];
        row[`h${h}`] = val == null ? "" : val.toFixed(2);
      }

      // 일간 합/평균
      const dRow = dayStatsMap[tag];
      if (dRow) {
        row.hourlySum = dRow.sum == null ? "" : dRow.sum.toFixed(2);
        row.hourlyAvg = dRow.avg == null ? "" : dRow.avg.toFixed(2);
      } else {
        row.hourlySum = "";
        row.hourlyAvg = "";
      }

      rows.push(row);
    });

    return rows;
  }, [subTags, pivotResult, dayStatsMap]);

  // 테이블 컬럼
  const columns = useMemo(() => {
    const hourCols = Array.from({ length: 24 }, (_, h) => ({
      title: `${h}시`,
      dataIndex: `h${h}`,
      key: `h${h}`,
      onCell: () => ({
        onClick: () => onHourClick?.(h),
        style: { cursor: onHourClick ? "pointer" : "auto" },
      }),
    }));

    return [
      {
        title: "항목",
        dataIndex: "category",
        key: "category",
        fixed: "left",
        width: 150,
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
  }, [onHourClick]);

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
