import React, { useState, useMemo } from "react";
import "@ant-design/v5-patch-for-react-19";
import { Select, Radio, Button } from "antd";

import useStats from "../hooks/useStats";  // CSV 로드 + 통계 훅
import StatsChart from "../components/StatsChart";
import MonthlyTable from "../components/MonthlyTable";
import DailyTable from "../components/DailyTable";
import HourlyTable from "../components/HourlyTable";

import { getDaysInMonth } from "../utils/getDaysInMonth"; // 월/일수 계산 헬퍼 (직접 구현)

const { Option } = Select;

export default function A() {
  // 1) 공통 훅 사용 (데이터 로드 + 통계 관련 함수)
  const { 
    rawData, loading, error, 
    availableYears, measureColumns,
    computeMonthlyStats, computeDailyStats, computeHourlyStats
  } = useStats("./data/dummy_data.csv");

  // 2) 상태
  const today = new Date();
  const [selectedYears, setSelectedYears] = useState([today.getFullYear().toString()]);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth()+1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const [calcMode, setCalcMode] = useState("sum"); 
  const [showChart, setShowChart] = useState(true);

  // 3) 월/일/시간별 통계
  const monthlyStats = useMemo(
    () => computeMonthlyStats(selectedYears, calcMode),
    [selectedYears, calcMode, computeMonthlyStats]
  );
  const dailyStats = useMemo(
    () => computeDailyStats(selectedYears, selectedMonth, calcMode),
    [selectedYears, selectedMonth, calcMode, computeDailyStats]
  );
  const hourlyStats = useMemo(
    () => computeHourlyStats(selectedYears, selectedMonth, selectedDay, calcMode),
    [selectedYears, selectedMonth, selectedDay, calcMode, computeHourlyStats]
  );

  // 4) 일수 계산
  const dayCount = useMemo(() => {
    if (!selectedMonth || !selectedYears.length) return 0;
    return getDaysInMonth(selectedYears, selectedMonth, "max");
  }, [selectedMonth, selectedYears]);

  // 5) 차트 데이터
  const { chartCategories, chartSeries } = useMemo(() => {
    // (예시) selectedMonth와 selectedDay 여부로 구분
    let mode = "month";
    if (selectedMonth && !selectedDay) mode = "day";
    if (selectedMonth && selectedDay) mode = "hour";

    switch (mode) {
      case "day": {
        const dayCount = getDaysInMonth(selectedYears, selectedMonth, "max");
        const categories = Array.from({ length: dayCount }, (_, i) => `${i + 1}일`);
        const series = measureColumns.map(col => {
          const arr = dailyStats[col] || [];
          return { name: col, data: arr.map(v => +v.toFixed(2)).slice(0, dayCount) };
        });
        return { chartCategories: categories, chartSeries: series };
      }
      case "hour": {
        const categories = Array.from({ length: 24 }, (_, i) => `${i}시`);
        const series = measureColumns.map(col => {
          const arr = hourlyStats[col] || [];
          return { name: col, data: arr.map(v => +v.toFixed(2)) };
        });
        return { chartCategories: categories, chartSeries: series };
      }
      default: { // month
        const categories = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
        const series = measureColumns.map(col => {
          const arr = monthlyStats[col] || [];
          return { name: col, data: arr.map(v => +v.toFixed(2)) };
        });
        return { chartCategories: categories, chartSeries: series };
      }
    }
  }, [
    measureColumns,
    monthlyStats,
    dailyStats,
    hourlyStats,
    selectedYears,
    selectedMonth,
    selectedDay,
  ]);

  // 연도 범위 타이틀
  const yearRangeTitle = useMemo(() => {
    if (!selectedYears.length) return "(연도를 선택해주세요)";
    const minYear = Math.min(...selectedYears.map(y => +y));
    const maxYear = Math.max(...selectedYears.map(y => +y));
    return minYear === maxYear ? `${minYear}년` : `${minYear} ~ ${maxYear}년`;
  }, [selectedYears]);

  // Render
  return (
    <div className="component">
      <h2>에너지사용량 (A)</h2>

      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="table-option">
        {/* 연도 선택 */}
        <div>
          <label>연도 선택: </label>
          <Select
            mode="multiple"
            value={selectedYears}
            onChange={vals => setSelectedYears(vals)}
            style={{ width: 300 }}
            placeholder="연도 선택"
          >
            {availableYears.map(year => (
              <Option key={year} value={year}>
                {year}
              </Option>
            ))}
          </Select>
        </div>

        {/* 합계/평균 모드 */}
        <div>
          <Radio.Group value={calcMode} onChange={e => setCalcMode(e.target.value)}>
            <Radio.Button value="sum">합계</Radio.Button>
            <Radio.Button value="avg">평균</Radio.Button>
          </Radio.Group>
        </div>

        {/* 차트 표시 토글 */}
        <Button onClick={() => setShowChart(prev => !prev)}>
          {showChart ? "차트 숨기기" : "차트 보기"}
        </Button>
      </div>

      {/* 차트 */}
      {showChart && (
        <StatsChart 
          title={
            `${yearRangeTitle} ` +
            (selectedMonth ? `${selectedMonth}월 ` : "") +
            (selectedDay ? `${selectedDay}일 ` : "") +
            (calcMode === "sum" ? "합계" : "평균") + " 차트"
          }
          categories={chartCategories}
          series={chartSeries}
        />
      )}

      {/* (A) 월별 테이블 */}
      <h3>
        {yearRangeTitle} {calcMode === "sum" ? "월별 합계" : "월별 평균"}
      </h3>
      <MonthlyTable
        measureColumns={measureColumns}
        monthlyStats={monthlyStats}
        onMonthClick={(m) => {
          setSelectedMonth(m);
          setSelectedDay(null);
        }}
      />

      {/* (B) 일별 테이블 */}
      {selectedMonth && (
        <div style={{ marginTop: 40 }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h4>
              {yearRangeTitle} {selectedMonth}월 {calcMode === "sum" ? "일별 합계" : "일별 평균"}
            </h4>
            <Button onClick={() => setSelectedMonth(null)}>닫기</Button>
          </div>
          <DailyTable
            measureColumns={measureColumns}
            dailyStats={dailyStats}
            dayCount={dayCount}
            onDayClick={(d) => setSelectedDay(d)}
          />

          {/* (C) 시간별 테이블 */}
          {selectedDay && (
            <div style={{ marginTop: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h4>
                  {yearRangeTitle} {selectedMonth}월 {selectedDay}일{" "}
                  {calcMode === "sum" ? "시간별 합계" : "시간별 평균"}
                </h4>
                <Button onClick={() => setSelectedDay(null)}>닫기</Button>
              </div>
              <HourlyTable
                measureColumns={measureColumns}
                hourlyStats={hourlyStats}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
