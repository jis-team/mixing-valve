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

  // 측정 컬럼(가령 "datetime" 제외)
  const measureColumns = useMemo(() => {
    if (!rawData.length) return [];
    const keys = Object.keys(rawData[0]);
    return keys.filter(k => k !== "datetime");
  }, [rawData]);

  // 월별 통계
  function computeMonthlyStats(selectedYears, calcMode) {
    if (!selectedYears.length) return {};
    const filtered = rawData.filter(item => {
      const year = item.datetime?.slice(0, 4);
      return selectedYears.includes(year);
    });

    const monthly = {};
    for (let m = 1; m <= 12; m++) {
      monthly[m] = {};
      measureColumns.forEach(col => (monthly[m][col] = []));
    }

    filtered.forEach(item => {
      const dObj = new Date(item.datetime);
      const m = dObj.getMonth() + 1;
      measureColumns.forEach(col => {
        if (typeof item[col] === "number") monthly[m][col].push(item[col]);
      });
    });

    const result = {};
    measureColumns.forEach(col => (result[col] = new Array(12).fill(0)));

    for (let m = 1; m <= 12; m++) {
      measureColumns.forEach(col => {
        const arr = monthly[m][col];
        if (arr.length) {
          const sum = arr.reduce((acc, val) => acc + val, 0);
          result[col][m - 1] = calcMode === "sum" ? sum : sum / arr.length;
        }
      });
    }
    return result;
  }

  // 일별 통계
  function computeDailyStats(selectedYears, selectedMonth, calcMode) {
    if (!selectedYears.length || !selectedMonth) return {};
    const filtered = rawData.filter(item => {
      const dObj = new Date(item.datetime);
      const y = dObj.getFullYear();
      const m = dObj.getMonth() + 1;
      return selectedYears.includes(String(y)) && m === selectedMonth;
    });

    const daily = {};
    for (let d = 1; d <= 31; d++) {
      daily[d] = {};
      measureColumns.forEach(col => (daily[d][col] = []));
    }

    filtered.forEach(item => {
      const dObj = new Date(item.datetime);
      const day = dObj.getDate();
      measureColumns.forEach(col => {
        if (typeof item[col] === "number") daily[day][col].push(item[col]);
      });
    });

    const result = {};
    measureColumns.forEach(col => (result[col] = new Array(31).fill(0)));

    for (let d = 1; d <= 31; d++) {
      measureColumns.forEach(col => {
        const arr = daily[d][col];
        if (arr.length) {
          const sum = arr.reduce((acc, val) => acc + val, 0);
          result[col][d - 1] = calcMode === "sum" ? sum : sum / arr.length;
        }
      });
    }
    return result;
  }

  // 시간별 통계
  function computeHourlyStats(selectedYears, month, day, calcMode) {
    if (!selectedYears.length || !month || !day) return {};
    const filtered = rawData.filter(item => {
      const dObj = new Date(item.datetime);
      return (
        selectedYears.includes(String(dObj.getFullYear())) &&
        dObj.getMonth() + 1 === month &&
        dObj.getDate() === day
      );
    });

    const hourly = {};
    for (let h = 0; h < 24; h++) {
      hourly[h] = {};
      measureColumns.forEach(col => (hourly[h][col] = []));
    }

    filtered.forEach(item => {
      const dObj = new Date(item.datetime);
      const hh = dObj.getHours();
      measureColumns.forEach(col => {
        if (typeof item[col] === "number") hourly[hh][col].push(item[col]);
      });
    });

    const result = {};
    measureColumns.forEach(col => (result[col] = new Array(24).fill(0)));

    for (let h = 0; h < 24; h++) {
      measureColumns.forEach(col => {
        const arr = hourly[h][col];
        if (arr.length) {
          const sum = arr.reduce((acc, val) => acc + val, 0);
          result[col][h] = calcMode === "sum" ? sum : sum / arr.length;
        }
      });
    }
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
