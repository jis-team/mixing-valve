// A.js
import React, { useState, useMemo, useEffect } from "react";
import "@ant-design/v5-patch-for-react-19";
import { Select, Radio, Button } from "antd";

import useStats from "../hooks/useStats";
import StatsChart from "../components/StatsChart";
import MonthlyTable from "../components/MonthlyTable";
import DailyTable from "../components/DailyTable";
import HourlyTable from "../components/HourlyTable";
import { getDaysInMonth } from "../utils/getDaysInMonth";

const { Option } = Select;
const title = "에너지사용량 (A)"

export default function A() {
  // 1) 데이터 로드 & 기본 훅
  const {
    loading,
    error,
    availableYears,
    measureColumns,
    computeMonthlyStats,
    computeDailyStats,
    computeHourlyStats,
  } = useStats("./data/dummy_data_a.csv");

  // 2) 연도/월/일 상태
  const today = new Date();
  const [selectedYears, setSelectedYears] = useState([String(today.getFullYear())]);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());

  const [calcMode, setCalcMode] = useState("sum");
  const [showChart, setShowChart] = useState(true);
  const [selectedMeasures, setSelectedMeasures] = useState([]);

  useEffect(() => {
    if (measureColumns.length > 0 && selectedMeasures.length === 0) {
      setSelectedMeasures(measureColumns);
    }
  }, [measureColumns, selectedMeasures]);

  // 3) 월/일/시간별 통계 (이미 연도별로 구분된 데이터)
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
    if (!selectedYears.length || !selectedMeasures.length) {
      return { chartCategories: [], chartSeries: [] };
    }

    // mode: month / day / hour
    if (!selectedMonth) {
      const categories = Array.from({ length: 12 }, (_, i) => `${i + 1}월`);
      const newSeries = [];
      selectedYears.forEach((year) => {
        selectedMeasures.forEach((col) => {
          const arr = monthlyStats[year]?.[col] || [];
          newSeries.push({
            name: `${year}년 - ${col}`,
            data: arr.map((v) => +v.toFixed(2)),
          });
        });
      });
      return { chartCategories: categories, chartSeries: newSeries };
    }
    else if (selectedMonth && !selectedDay) {
      const dayCountMax = getDaysInMonth(selectedYears, selectedMonth, "max");
      const categories = Array.from({ length: dayCountMax }, (_, i) => `${i + 1}일`);
      const newSeries = [];
      selectedYears.forEach((year) => {
        selectedMeasures.forEach((col) => {
          const arr = dailyStats[year]?.[col] || [];
          newSeries.push({
            name: `${year}년 - ${col}`,
            data: arr.slice(0, dayCountMax).map((v) => +v.toFixed(2)),
          });
        });
      });
      return { chartCategories: categories, chartSeries: newSeries };
    }
    else {
      const categories = Array.from({ length: 24 }, (_, i) => `${i}시`);
      const newSeries = [];
      selectedYears.forEach((year) => {
        selectedMeasures.forEach((col) => {
          const arr = hourlyStats[year]?.[col] || [];
          newSeries.push({
            name: `${year}년 - ${col}`,
            data: arr.map((v) => +v.toFixed(2)),
          });
        });
      });
      return { chartCategories: categories, chartSeries: newSeries };
    }
  }, [
    selectedYears, selectedMonth, selectedDay, selectedMeasures,
    monthlyStats, dailyStats, hourlyStats
  ]);

  // 6) 연도 범위 타이틀
  const yearRangeTitle = useMemo(() => {
    if (!selectedYears.length) return "(연도를 선택해주세요)";
    selectedYears.sort();
    return selectedYears.join(", ") + "년 "
  }, [selectedYears]);

  // 7) 렌더
  return (
    <div className="row">
      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <section className="header">
        <h2>{title}</h2>

        <div className="page-option">
          {/* (A) 항목 선택 */}
          <div className="select-measure">
            <label>항목 선택 : </label>
            <Select
              mode="multiple"
              value={selectedMeasures}
              onChange={vals => setSelectedMeasures(vals)}
              maxTagCount={2}          // 태그를 2개까지만 표시
              maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} 항목`}
              placeholder="항목 선택"
            >
              {measureColumns.map(col => (
                <Option key={col} value={col}>
                  {col}
                </Option>
              ))}
            </Select>
          </div>

          {/* (B) 연도 선택 */}
          <div className="select-year">
            <label>연도 선택 : </label>
            <Select
              mode="multiple"
              value={selectedYears}
              onChange={vals => setSelectedYears(vals)}
              maxTagCount={5}          // 태그를 5개까지만 표시
              maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} 항목`}
              placeholder="연도 선택"
            >
              {availableYears.map(year => (
                <Option key={year} value={year}>
                  {year}
                </Option>
              ))}
            </Select>
          </div>

          {/* (C) 합계/평균 모드 */}
          <div className="select-calc-mode">
            <Radio.Group value={calcMode} onChange={e => setCalcMode(e.target.value)}>
              <Radio.Button value="sum">합계</Radio.Button>
              <Radio.Button value="avg">평균</Radio.Button>
            </Radio.Group>
          </div>

          {/* (D) 차트 표시 토글 */}
          <div className="select-chart-show">
            <Button onClick={() => setShowChart(prev => !prev)}>
              {showChart ? "차트 숨기기" : "차트 보기"}
            </Button>
          </div>
        </div>
      </section>

      <section className="chart-section">
        {showChart && (
          <div className="chart">
            <div className="chart-header">
              <h3>
                {`${yearRangeTitle} `}
                {selectedMonth ? `${selectedMonth}월 ` : ""}
                {selectedDay ? `${selectedDay}일 ` : ""}
                {calcMode === "sum" ? "합계" : "평균"} 차트
              </h3>
            </div>
            <StatsChart
              categories={chartCategories}
              series={chartSeries}
            />
          </div>
        )}
      </section>

      {/* (A) 월별 테이블 */}
      <section className="table-section">
        <div className="table month-table">
          <h3>
            {yearRangeTitle} {calcMode === "sum" ? "월별 합계" : "월별 평균"}
          </h3>
          <MonthlyTable
            /* 추가: selectedMeasures도 넘겨서 테이블에서 해당 항목만 보이도록 */
            selectedYears={selectedYears}
            selectedMeasures={selectedMeasures}
            monthlyStats={monthlyStats}
            onMonthClick={(m) => {
              setSelectedMonth(m);
              setSelectedDay(null);
            }}
          />
        </div>

        {/* (B) 일별 테이블 */}
        {selectedMonth && (
          <div className="table day-table" style={{ marginTop: 24 }}>
            <div className="table-header">
              <h3>
                {yearRangeTitle} {selectedMonth}월 {calcMode === "sum" ? "일별 합계" : "일별 평균"}
              </h3>
              <Button onClick={() => setSelectedMonth(null)}>닫기</Button>
            </div>
            <DailyTable
              selectedYears={selectedYears}
              selectedMeasures={selectedMeasures}
              dailyStats={dailyStats}
              dayCount={dayCount}
              onDayClick={(d) => setSelectedDay(d)}
            />
          </div>
        )}

        {/* (C) 시간별 테이블 */}
        {selectedMonth && selectedDay && (
          <div className="table hour-table" style={{ marginTop: 24 }}>
            <div className="table-header">
              <h3>
                {yearRangeTitle} {selectedMonth}월 {selectedDay}일{" "}
                {calcMode === "sum" ? "시간별 합계" : "시간별 평균"}
              </h3>
              <Button onClick={() => setSelectedDay(null)}>닫기</Button>
            </div>
            <HourlyTable
              selectedYears={selectedYears}
              selectedMeasures={selectedMeasures}
              hourlyStats={hourlyStats}
            />
          </div>
        )}
      </section>
    </div>
  );
}
