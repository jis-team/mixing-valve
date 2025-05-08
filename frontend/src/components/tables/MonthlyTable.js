// ./src/components/tables/MonthlyTable.js
import React, { useMemo } from "react";
import { Table } from "antd";

/**
 * @param {string[]} subTags       - 보여줄 항목 목록
 * @param {Object[]} monthStats    - dummy_data_month_stats에서 가져온 통계 배열
 * @param {Object[]} yearStats     - dummy_data_year_stats (연간 합계/평균용), optional
 * @param {string}   calcMode      - "sum" | "avg"
 * @param {function} onMonthClick  - (month: number) => void
 */
function MonthlyTable({ subTags, monthStats, yearStats = [], calcMode, onMonthClick }) {
  /**
   * monthStats 구조 예:
   * [
   *   { tag: "에너지사용량", datetime: "2023-01", sum: 1234.56, avg: 12.34 },
   *   { tag: "에너지사용량", datetime: "2023-02", sum: 2345.67, avg: 23.45 },
   *   { tag: "송출량", datetime: "2023-01", sum: 100,     avg: 5.00 },
   *   ...
   * ]
   */

  // 연도 파싱 (예: "2023-01" -> "2023")
  // 여러 연도가 섞여 있다면, 실제로는 필터 로직이 필요할 수도 있음
  // 여기서는 한 연도만 온다고 가정
  // 연간 합계/평균 표시를 위해 yearStats도 이용
  const yearStatsMap = useMemo(() => {
    // yearStats = [
    //   { tag: "에너지사용량", datetime: "2023", sum: 12345.67, avg: 34.56 },
    //   ...
    // ]
    const map = {};
    yearStats.forEach((row) => {
      map[row.tag] = row; // tag 기준으로 1:1 매핑
    });
    return map;
  }, [yearStats]);

  // 월별 데이터를 태그별로 (12개월) 정리
  const pivotResult = useMemo(() => {
    // subTags.forEach(...) => { [tag]: [12개의 값], ... }
    const result = {};
    subTags.forEach((tag) => {
      // 12칸 null로 초기화
      result[tag] = Array(12).fill(null);
    });

    // monthStats를 순회하여 datetime에서 월을 파싱해 해당 칸에 sum/avg를 배치
    monthStats.forEach((row) => {
      const { tag, datetime } = row;
      if (!subTags.includes(tag)) return;

      // datetime "2023-02" → month = 2
      const parts = datetime.split("-");
      if (parts.length !== 2) return;
      const m = Number(parts[1]); // "02" -> 2

      if (!Number.isNaN(m) && m >= 1 && m <= 12) {
        // sum/avg 중 calcMode 골라서 사용
        const val = row[calcMode];
        result[tag][m - 1] = val;
      }
    });

    return result; // { [tag]: [12개 값], ... }
  }, [subTags, monthStats, calcMode]);

  // 테이블 표시용 dataSource
  const dataSource = useMemo(() => {
    // 각 subTag마다 한 행
    // 각 행은 m1, m2, ... m12, yearSum, yearAvg 등 포함
    const rows = [];

    subTags.forEach((tag) => {
      const monthlyArr = pivotResult[tag] || [];
      // ex) monthlyArr[0] = 1월 값, monthlyArr[1] = 2월 값, ...

      const row = {
        key: tag,
        category: tag,
      };

      monthlyArr.forEach((val, idx) => {
        const colName = `m${idx + 1}`; // m1 ~ m12
        row[colName] = val == null ? "" : val.toFixed(2);
      });

      // 연간 합계/평균
      const yRow = yearStatsMap[tag];
      if (yRow) {
        const sumVal = yRow.sum;
        const avgVal = yRow.avg;
        row.yearSum = sumVal == null ? "" : sumVal.toFixed(2);
        row.yearAvg = avgVal == null ? "" : avgVal.toFixed(2);
      } else {
        row.yearSum = "";
        row.yearAvg = "";
      }

      rows.push(row);
    });

    return rows;
  }, [subTags, pivotResult, yearStatsMap]);

  // 테이블 컬럼
  const columns = useMemo(() => {
    const monthCols = Array.from({ length: 12 }, (_, idx) => {
      const m = idx + 1;
      return {
        title: `${m}월`,
        dataIndex: `m${m}`,
        key: `m${m}`,
        onCell: () => ({
          onClick: () => onMonthClick?.(m),
          style: { cursor: onMonthClick ? "pointer" : "auto" },
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
      ...monthCols,
      {
        title: "연간 합계",
        dataIndex: "yearSum",
        key: "yearSum",
        sorter: (a, b) => parseFloat(a.yearSum) - parseFloat(b.yearSum),
      },
      {
        title: "연간 평균",
        dataIndex: "yearAvg",
        key: "yearAvg",
        sorter: (a, b) => parseFloat(a.yearAvg) - parseFloat(b.yearAvg),
      },
    ];
  }, [onMonthClick]);

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
