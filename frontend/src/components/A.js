import React, { useEffect, useState, useMemo } from "react";
import "@ant-design/v5-patch-for-react-19";
import { Table, Select, Radio, Button } from "antd";
import Chart from "react-apexcharts";
import { parseCsv } from "./_parseCsv";

// Multi-select용
const { Option } = Select;

// 연/월 일수 구하는 헬퍼
function getDaysInMonth(years, month, mode = "max") {
  if (!years || !years.length) return 0;

  let dayArray = years.map((y) => {
    const yearNum = typeof y === "string" ? parseInt(y, 10) : y;
    return new Date(yearNum, month, 0).getDate();
  });

  if (mode === "max") {
    return Math.max(...dayArray);
  } else {
    return Math.min(...dayArray);
  }
}

export default function APage() {
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showChart, setShowChart] = useState(true);

  // 여러 해 선택
  const [selectedYears, setSelectedYears] = useState(["2023"]);

  // 합계/평균 모드
  const [calcMode, setCalcMode] = useState("sum"); // "sum" or "avg"

  // 일별/시간별 테이블 표시를 위한 상태
  const [selectedMonth, setSelectedMonth] = useState(null); // 1..12
  const [selectedDay, setSelectedDay] = useState(null);     // 1..31

  const handleToggleChart = () => { setShowChart((prev) => !prev); };

  // CSV 데이터 로드
  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await parseCsv("./data/dummy_data.csv");
        setRawData(result);
      } catch (err) {
        console.error(err);
        setError("CSV 로드 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ==========================================================
  // 가용 연도, 측정 컬럼
  // ==========================================================
  const availableYears = useMemo(() => {
    if (!rawData || !rawData.length) return [];
    const yearSet = new Set();
    rawData.forEach((item) => {
      const y = item.datetime?.slice(0, 4);
      if (y) yearSet.add(y);
    });
    return Array.from(yearSet).sort();
  }, [rawData]);

  const measureColumns = useMemo(() => {
    if (!rawData || !rawData.length) return [];
    const keys = Object.keys(rawData[0]);
    return keys.filter((k) => k !== "datetime");
  }, [rawData]);

  // ==========================================================
  // 월별 데이터 집계
  // ==========================================================
  function computeMonthlyStats(years, mode) {
    const filtered = rawData.filter((item) => {
      if (!item.datetime) return false;
      const y = item.datetime.slice(0, 4);
      return years.includes(y);
    });

    const monthly = {};
    for (let m = 1; m <= 12; m++) {
      monthly[m] = {};
      measureColumns.forEach((col) => {
        monthly[m][col] = [];
      });
    }

    filtered.forEach((item) => {
      const dObj = new Date(item.datetime);
      const m = dObj.getMonth() + 1;
      measureColumns.forEach((col) => {
        if (typeof item[col] === "number") {
          monthly[m][col].push(item[col]);
        }
      });
    });

    const result = {};
    measureColumns.forEach((col) => {
      result[col] = Array(12).fill(0);
    });

    for (let m = 1; m <= 12; m++) {
      measureColumns.forEach((col) => {
        const arr = monthly[m][col];
        if (arr.length > 0) {
          const sum = arr.reduce((acc, val) => acc + val, 0);
          result[col][m - 1] = mode === "sum" ? sum : sum / arr.length;
        }
      });
    }
    return result; // { a: [...12], b: [...12], c: [...], ... }
  }

  const monthlyStats = useMemo(() => {
    if (!selectedYears.length || !measureColumns.length) return {};
    return computeMonthlyStats(selectedYears, calcMode);
  }, [selectedYears, measureColumns, calcMode, rawData]);

  // ==========================================================
  // 일별 데이터 집계
  // ==========================================================
  function computeDailyStats(years, month, mode) {
    if (!month) return {};
    const filtered = rawData.filter((item) => {
      if (!item.datetime) return false;
      const dObj = new Date(item.datetime);
      const y = dObj.getFullYear();
      const m = dObj.getMonth() + 1;
      return years.includes(String(y)) && m === month;
    });

    const daily = {};
    for (let d = 1; d <= 31; d++) {
      daily[d] = {};
      measureColumns.forEach((col) => {
        daily[d][col] = [];
      });
    }

    filtered.forEach((item) => {
      const dObj = new Date(item.datetime);
      const day = dObj.getDate();
      measureColumns.forEach((col) => {
        if (typeof item[col] === "number") {
          daily[day][col].push(item[col]);
        }
      });
    });

    const result = {};
    measureColumns.forEach((col) => {
      result[col] = Array(31).fill(0);
    });

    for (let d = 1; d <= 31; d++) {
      measureColumns.forEach((col) => {
        const arr = daily[d][col];
        if (arr.length > 0) {
          const sum = arr.reduce((acc, val) => acc + val, 0);
          result[col][d - 1] = mode === "sum" ? sum : sum / arr.length;
        }
      });
    }
    return result;
  }

  const dailyStats = useMemo(() => {
    if (!selectedYears.length || !selectedMonth) return {};
    return computeDailyStats(selectedYears, selectedMonth, calcMode);
  }, [selectedYears, selectedMonth, calcMode, measureColumns, rawData]);

  // ==========================================================
  // 시간별 데이터 집계
  // ==========================================================
  function computeHourlyStats(years, month, day, mode) {
    if (!month || !day) return {};
    const filtered = rawData.filter((item) => {
      if (!item.datetime) return false;
      const dObj = new Date(item.datetime);
      const y = dObj.getFullYear();
      const m = dObj.getMonth() + 1;
      const dd = dObj.getDate();
      return years.includes(String(y)) && m === month && dd === day;
    });

    const hourly = {};
    for (let h = 0; h < 24; h++) {
      hourly[h] = {};
      measureColumns.forEach((col) => {
        hourly[h][col] = [];
      });
    }

    filtered.forEach((item) => {
      const dObj = new Date(item.datetime);
      const hh = dObj.getHours();
      measureColumns.forEach((col) => {
        if (typeof item[col] === "number") {
          hourly[hh][col].push(item[col]);
        }
      });
    });

    const result = {};
    measureColumns.forEach((col) => {
      result[col] = Array(24).fill(0);
    });

    for (let h = 0; h < 24; h++) {
      measureColumns.forEach((col) => {
        const arr = hourly[h][col];
        if (arr.length > 0) {
          const sum = arr.reduce((acc, val) => acc + val, 0);
          result[col][h] = mode === "sum" ? sum : sum / arr.length;
        }
      });
    }
    return result;
  }

  const hourlyStats = useMemo(() => {
    if (!selectedYears.length || !selectedMonth || !selectedDay) return {};
    return computeHourlyStats(selectedYears, selectedMonth, selectedDay, calcMode);
  }, [selectedYears, selectedMonth, selectedDay, calcMode, measureColumns, rawData]);

  // ==========================================================
  // 월별 테이블
  // ==========================================================
  const monthTableColumns = useMemo(() => {
    const monthCols = Array.from({ length: 12 }, (_, idx) => {
      const mm = idx + 1;
      return {
        title: `${mm}월`,
        dataIndex: `m${mm}`,
        key: `m${mm}`,
        onHeaderCell: () => ({
          style: { cursor: "pointer" },
          onClick: () => {
            setSelectedMonth(mm);
            setSelectedDay(null);
          },
        }),
      };
    });

    return [
      {
        title: "항목",
        dataIndex: "category",
        key: "category",
        fixed: "left",
        filters: measureColumns.map((col) => ({ text: col, value: col })),
        onFilter: (value, record) => record.category === value,
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
  }, [measureColumns]);

  const monthTableData = useMemo(() => {
    if (!Object.keys(monthlyStats).length) return [];
    const rows = [];
    measureColumns.forEach((col) => {
      const values = monthlyStats[col] ?? [];
      const row = { key: col, category: col };
      let sum = 0;
      values.forEach((val, idx) => {
        row[`m${idx + 1}`] = val.toFixed(2);
        sum += val;
      });
      row.yearSum = sum.toFixed(2);
      row.yearAvg = (sum / 12).toFixed(2);
      rows.push(row);
    });
    return rows;
  }, [monthlyStats, measureColumns]);

  // ==========================================================
  // 일별 테이블
  // ==========================================================
  const dayCount = useMemo(() => {
    if (!selectedMonth || !selectedYears.length) return 0;
    return getDaysInMonth(selectedYears, selectedMonth, "max");
  }, [selectedMonth, selectedYears]);

  const dailyColumns = useMemo(() => {
    // dayCount = getDaysInMonth(...)
    if (!dayCount) return [];
    const dayCols = Array.from({ length: dayCount }, (_, idx) => ({
      title: `${idx + 1}일`,
      dataIndex: `d${idx + 1}`,
      key: `d${idx + 1}`,
      onHeaderCell: () => ({
        style: { cursor: "pointer" },
        onClick: () => setSelectedDay(idx + 1),
      }),
    }));

    return [
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
  }, [dayCount]);

  const dailyTableData = useMemo(() => {
    if (!Object.keys(dailyStats).length || !dayCount) return [];
    const rows = [];
    measureColumns.forEach((col) => {
      const values = dailyStats[col] ?? [];
      const row = { key: col, category: col };
      let sum = 0;
      for (let i = 0; i < dayCount; i++) {
        const val = values[i] ?? 0;
        sum += val;
        row[`d${i + 1}`] = val.toFixed(2);
      }
      row.monthlySum = sum.toFixed(2);
      row.monthlyAvg = (sum / dayCount).toFixed(2);
      rows.push(row);
    });
    return rows;
  }, [dailyStats, dayCount, measureColumns]);

  // ==========================================================
  // 시간별 테이블
  // ==========================================================
  const hourlyColumns = useMemo(() => {
    const hourCols = Array.from({ length: 24 }, (_, idx) => ({
      title: `${idx}시`,
      dataIndex: `h${idx}`,
      key: `h${idx}`,
    }));
    return [
      {
        title: "항목",
        dataIndex: "category",
        key: "category",
        fixed: "left",
        filters: measureColumns.map((col) => ({ text: col, value: col })),
        onFilter: (value, record) => record.category === value,
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
  }, [measureColumns]);

  const hourlyTableData = useMemo(() => {
    if (!Object.keys(hourlyStats).length) return [];
    const rows = [];
    measureColumns.forEach((col) => {
      const values = hourlyStats[col] ?? [];
      const row = { key: col, category: col };
      let sum = 0;
      for (let h = 0; h < 24; h++) {
        const val = values[h] ?? 0;
        sum += val;
        row[`h${h}`] = val.toFixed(2);
      }
      row.hourlySum = sum.toFixed(2);
      row.hourlyAvg = (sum / 24).toFixed(2);
      rows.push(row);
    });
    return rows;
  }, [hourlyStats, measureColumns]);

  // =======================
  // 차트
  // =======================
  const [chartOptions, setChartOptions] = useState({
    chart: { type: "line" },
    xaxis: { categories: [] },
    stroke: { curve: "smooth" },
  });
  const [chartSeries, setChartSeries] = useState([]);

  // chartData 업데이트 로직
  useEffect(() => {
    if (!selectedYears.length) {
      setChartSeries([]);
      setChartOptions((prev) => ({ ...prev, xaxis: { categories: [] } }));
      return;
    }

    // 1) 범위 판단
    let mode = "month";
    if (selectedMonth && !selectedDay) {
      mode = "day";
    } else if (selectedMonth && selectedDay) {
      mode = "hour";
    }

    // 2) 데이터 생성
    if (mode === "month") {
      // if (!Object.keys(monthlyStats).length) {
      //   setChartSeries([]);
      //   setChartOptions((prev) => ({
      //     ...prev,
      //     xaxis: { categories: [] }
      //   }));
      //   return;
      // }

      const categories = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
      const newSeries = measureColumns.map((col) => {
        const vals = monthlyStats[col] ?? [];
        return {
          name: col,
          data: vals.map((v) => +v.toFixed(2)),
        };
      });
      setChartSeries(newSeries);
      setChartOptions((prev) => ({
        ...prev,
        xaxis: { categories },
      }));
    }

    if (mode === "day") {
      // if (!Object.keys(dailyStats).length) {
      //   setChartSeries([]);
      //   setChartOptions((prev) => ({
      //     ...prev,
      //     xaxis: { categories: [] }
      //   }));
      //   return;
      // }

      const dayCount = getDaysInMonth(selectedYears, selectedMonth, "max");

      const categories = Array.from({ length: dayCount }, (_, i) => `${i + 1}일`);
      const newSeries = measureColumns.map((col) => {
        const arr = dailyStats[col] ?? [];
        const data = arr.slice(0, dayCount).map((v) => +v.toFixed(2));
        return { name: col, data };
      });

      setChartSeries(newSeries);
      setChartOptions((prev) => ({
        ...prev,
        xaxis: { categories },
      }));
    }

    if (mode === "hour") {
      // if (!Object.keys(hourlyStats).length) {
      //   setChartSeries([]);
      //   setChartOptions((prev) => ({
      //     ...prev,
      //     xaxis: { categories: [] }
      //   }));
      //   return;
      // }

      const categories = Array.from({ length: 24 }, (_, i) => `${i}시`);
      const newSeries = measureColumns.map((col) => {
        const arr = hourlyStats[col] ?? [];
        return {
          name: col,
          data: arr.map((v) => +v.toFixed(2)),
        };
      });
      setChartSeries(newSeries);
      setChartOptions((prev) => ({
        ...prev,
        xaxis: { categories },
      }));
    }
  }, [
    selectedYears,
    selectedMonth,
    selectedDay,
    monthlyStats,
    dailyStats,
    hourlyStats,
    measureColumns,
    showChart,
  ]);

  // ==========================================================
  // 8) Render
  // ==========================================================
  const yearRangeTitle = useMemo(() => {
    if (!selectedYears.length) return "(연도를 선택해주세요)";
    const minYear = Math.min(...selectedYears.map((y) => +y));
    const maxYear = Math.max(...selectedYears.map((y) => +y));
    if (minYear === maxYear) {
      return `${minYear}년`; 
    }
    return `${minYear} ~ ${maxYear}년`;
  }, [selectedYears]);

  return (
    <div className="component">
      <h2>에너지사용량 (A)</h2>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="table-option">
        <div className="option-select_year">
          <label>연도 선택: </label>
          <Select
            mode="multiple"
            value={selectedYears}
            onChange={(vals) => setSelectedYears(vals)}
            style={{ width: 300 }}
            placeholder="여러 연도 선택"
            disabled={loading || error}
          >
            {availableYears.map((year) => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </div>

        {/* 합계/평균 모드 */}
        <div className="option-calc_mode">
          <Radio.Group
            value={calcMode}
            onChange={(e) => setCalcMode(e.target.value)}
            disabled={loading || error}
          >
            <Radio.Button value="sum">합계</Radio.Button>
            <Radio.Button value="avg">평균</Radio.Button>
          </Radio.Group>
        </div>
        
        {/* 차트 보기/숨기기기 */}
        <div className="option-chart_view">
          <Button onClick={handleToggleChart}>
            {showChart ? "차트 숨기기" : "차트 보기"}
          </Button>
        </div>
      </div>
      
      {/* 차트 */}      
      {showChart && (
        <div>
          <div style={{ marginBottom: 30 }}>
            <h3>
              {yearRangeTitle}
              {" "}
              {selectedMonth
                ? selectedDay
                  ? `${selectedMonth}월 ${selectedDay}일 `
                  : `${selectedMonth}월 `
                : ""}
              {calcMode === "sum" ? "합계" : "평균"} 차트
            </h3>
          </div> 
          <div style={{ maxWidth: "100%" }}>
            <Chart
              options={chartOptions}
              series={chartSeries}
              type="line"
              height={300}
            />
          </div>  
        </div>
      )}

      {/* (A) 월별 테이블 */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h3>
          {yearRangeTitle} {calcMode === "sum" ? "월별 합계" : "월별 평균"}
        </h3>
      </div>
      <Table
        columns={monthTableColumns}
        dataSource={monthTableData}
        pagination={false}
        bordered
        scroll={{ x: "max-content" }}
      />      

      {/* (B) 일별 테이블 */}
      {selectedMonth && (
        <div style={{ marginTop: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4>
              {yearRangeTitle} {selectedMonth}월{" "}
              {calcMode === "sum" ? "일별 합계" : "일별 평균"}
            </h4>
            <Button onClick={() => setSelectedMonth(null)}>닫기</Button>
          </div>
          <Table
            columns={dailyColumns}
            dataSource={dailyTableData}
            pagination={false}
            bordered
            scroll={{ x: "max-content" }}
            style={{ marginTop: 16 }}
          />

          {/* (C) 시간별 테이블 */}
          {selectedDay && (
            <div style={{ marginTop: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center"  }}>
                <h4>
                  {yearRangeTitle} {selectedMonth}월 {selectedDay}일{" "}
                  {calcMode === "sum" ? "시간별 합계" : "시간별 평균"}
                </h4>
                <Button onClick={() => setSelectedDay(null)}>닫기</Button>
              </div>
              <Table
                columns={hourlyColumns}
                dataSource={hourlyTableData}
                pagination={false}
                bordered
                scroll={{ x: "max-content" }}
                style={{ marginTop: 16 }}
              />

            </div>
          )}
        </div>
      )}
    </div>
  );
}
