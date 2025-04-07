// useStats.js
import { useState, useEffect, useMemo } from "react";
import { parseCsv } from "../utils/parseCsv";

export default function useStats(csvPath) {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // CSV 로드
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const result = await parseCsv(csvPath);
        setRawData(result);
      } catch (err) {
        setError("CSV 로드 중 오류가 발생했습니다.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [csvPath]);

  // 가용 연도
  const availableYears = useMemo(() => {
    if (!rawData.length) return [];
    const yearSet = new Set();
    rawData.forEach(item => {
      const y = item.datetime?.slice(0, 4);
      if (y) yearSet.add(y);
    });
    return Array.from(yearSet).sort();
  }, [rawData]);

  // 측정 컬럼 (datetime 제외)
  const measureColumns = useMemo(() => {
    if (!rawData.length) return [];
    const keys = Object.keys(rawData[0]);
    return keys.filter(k => k !== "datetime");
  }, [rawData]);

  /* ------------------------------------------------------------------
   * (A) 월별 통계 (연도별 분리)
   *   => 반환 구조 예시:
   *   {
   *     "2022": { colA: [...12], colB: [...12], ... },
   *     "2023": { colA: [...12], colB: [...12], ... }
   *   }
   * ------------------------------------------------------------------ */
  function computeMonthlyStats(selectedYears, calcMode) {
    const result = {};
    selectedYears.forEach(yearStr => {
      // 1) 연도에 맞는 데이터 필터
      const filtered = rawData.filter(item => {
        const year = item.datetime?.slice(0, 4);
        return year === yearStr;
      });

      // 2) 월별 데이터 수집
      const monthly = {};
      for (let m = 1; m <= 12; m++) {
        monthly[m] = {};
        measureColumns.forEach(col => (monthly[m][col] = []));
      }

      filtered.forEach(item => {
        const dObj = new Date(item.datetime);
        const m = dObj.getMonth() + 1;
        measureColumns.forEach(col => {
          if (typeof item[col] === "number") {
            monthly[m][col].push(item[col]);
          }
        });
      });

      // 3) 월별 합계/평균 계산
      const yearResult = {};
      measureColumns.forEach(col => {
        yearResult[col] = Array(12).fill(0);
      });

      for (let m = 1; m <= 12; m++) {
        measureColumns.forEach(col => {
          const arr = monthly[m][col];
          if (arr.length) {
            const sum = arr.reduce((acc, val) => acc + val, 0);
            yearResult[col][m - 1] = (calcMode === "sum") ? sum : sum / arr.length;
          }
        });
      }

      // 4) result에 할당
      result[yearStr] = yearResult;
    });
    return result;
  }

  /* ------------------------------------------------------------------
   * (B) 일별 통계 (연도별 분리)
   *   => 반환 구조 예시:
   *   {
   *     "2022": { colA: [...31], colB: [...31], ... },
   *     "2023": { colA: [...31], colB: [...31], ... }
   *   }
   * ------------------------------------------------------------------ */
  function computeDailyStats(selectedYears, month, calcMode) {
    const result = {};

    if (!month) return result;
    selectedYears.forEach(yearStr => {
      // 1) 해당 연도+월 데이터만 필터
      const filtered = rawData.filter(item => {
        const dObj = new Date(item.datetime);
        const y = dObj.getFullYear();
        const m = dObj.getMonth() + 1;
        return String(y) === yearStr && m === month;
      });

      // 2) 일별 데이터 수집 (1~31일)
      const daily = {};
      for (let d = 1; d <= 31; d++) {
        daily[d] = {};
        measureColumns.forEach(col => (daily[d][col] = []));
      }

      filtered.forEach(item => {
        const dObj = new Date(item.datetime);
        const day = dObj.getDate();
        measureColumns.forEach(col => {
          if (typeof item[col] === "number") {
            daily[day][col].push(item[col]);
          }
        });
      });

      // 3) 일별 합계/평균 계산
      const yearResult = {};
      measureColumns.forEach(col => {
        yearResult[col] = Array(31).fill(0);
      });

      for (let d = 1; d <= 31; d++) {
        measureColumns.forEach(col => {
          const arr = daily[d][col];
          if (arr.length) {
            const sum = arr.reduce((acc, val) => acc + val, 0);
            yearResult[col][d - 1] = (calcMode === "sum") ? sum : sum / arr.length;
          }
        });
      }

      // 4) result에 할당
      result[yearStr] = yearResult;
    });

    return result;
  }

  /* ------------------------------------------------------------------
   * (C) 시간별 통계 (연도별 분리)
   *   => 반환 구조 예시:
   *   {
   *     "2022": { colA: [...24], colB: [...24], ... },
   *     "2023": { colA: [...24], colB: [...24], ... }
   *   }
   * ------------------------------------------------------------------ */
  function computeHourlyStats(selectedYears, month, day, calcMode) {
    const result = {};

    if (!month || !day) return result;
    selectedYears.forEach(yearStr => {
      // 1) 해당 연도+월+일 데이터만 필터
      const filtered = rawData.filter(item => {
        const dObj = new Date(item.datetime);
        return (
          String(dObj.getFullYear()) === yearStr &&
          (dObj.getMonth() + 1) === month &&
          dObj.getDate() === day
        );
      });

      // 2) 시간별 데이터 수집 (0~23시)
      const hourly = {};
      for (let h = 0; h < 24; h++) {
        hourly[h] = {};
        measureColumns.forEach(col => (hourly[h][col] = []));
      }

      filtered.forEach(item => {
        const dObj = new Date(item.datetime);
        const hh = dObj.getHours();
        measureColumns.forEach(col => {
          if (typeof item[col] === "number") {
            hourly[hh][col].push(item[col]);
          }
        });
      });

      // 3) 시간별 합계/평균 계산
      const yearResult = {};
      measureColumns.forEach(col => {
        yearResult[col] = Array(24).fill(0);
      });

      for (let h = 0; h < 24; h++) {
        measureColumns.forEach(col => {
          const arr = hourly[h][col];
          if (arr.length) {
            const sum = arr.reduce((acc, val) => acc + val, 0);
            yearResult[col][h] = (calcMode === "sum") ? sum : sum / arr.length;
          }
        });
      }

      // 4) result에 할당
      result[yearStr] = yearResult;
    });

    return result;
  }

  return {
    rawData,
    loading,
    error,
    availableYears,
    measureColumns,
    computeMonthlyStats,
    computeDailyStats,
    computeHourlyStats,
  };
}
