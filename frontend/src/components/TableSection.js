// ./src/components/TableSection.js
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import "@ant-design/v5-patch-for-react-19";
import { Select, Radio } from "antd";

import MonthlyTable from "./MonthlyTable";
import DailyTable from "./DailyTable";
import HourlyTable from "./HourlyTable";

import { fetchTableData } from "../store/csvSlice";
import { getDaysInMonth } from "../utils/getDaysInMonth";
import {
  computeMonthlyStats,
  computeDailyStats,
  computeHourlyStats,
} from "../utils/calcStats";

const { Option } = Select;

export default function TableSection({ tableName }) {
  const dispatch = useDispatch();
  const { csvMap, loadingMap, errorMap } = useSelector((state) => state.csv);

  // DB 테이블 로드
  useEffect(() => {
    if (tableName) {
      dispatch(fetchTableData(tableName));
    }
  }, [tableName, dispatch]);

  const rawData = csvMap[tableName] || [];
  const loading = loadingMap[tableName] || false;
  const error = errorMap[tableName] || null;

  // 가용 연도
  const availableYears = useMemo(() => {
    const setY = new Set();
    rawData.forEach((item) => {
      const yy = item.datetime?.slice(0, 4);
      if (yy) setY.add(yy);
    });
    return Array.from(setY).sort();
  }, [rawData]);

  // 측정 컬럼
  const measureColumns = useMemo(() => {
    if (!rawData.length) return [];
    return Object.keys(rawData[0]).filter((k) => k !== "datetime");
  }, [rawData]);

  // 상태값
  const today = new Date();
  const [selectedYears, setSelectedYears] = useState([String(today.getFullYear())]);
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [calcMode, setCalcMode] = useState("sum");

  const [selectedMeasures, setSelectedMeasures] = useState([]);
  useEffect(() => {
    if (measureColumns.length > 0 && selectedMeasures.length === 0) {
      setSelectedMeasures(measureColumns);
    }
  }, [measureColumns, selectedMeasures]);

  // 통계 계산
  const monthlyStats = useMemo(() => {
    return computeMonthlyStats(rawData, measureColumns, selectedYears, calcMode);
  }, [rawData, measureColumns, selectedYears, calcMode]);

  const dailyStats = useMemo(() => {
    return computeDailyStats(rawData, measureColumns, selectedYears, selectedMonth, calcMode);
  }, [rawData, measureColumns, selectedYears, selectedMonth, calcMode]);

  const hourlyStats = useMemo(() => {
    return computeHourlyStats(rawData, measureColumns, selectedYears, selectedMonth, selectedDay, calcMode);
  }, [rawData, measureColumns, selectedYears, selectedMonth, selectedDay, calcMode]);

  // 일수 계산
  const dayCount = useMemo(() => {
    if (!selectedMonth || !selectedYears.length) return 0;
    return getDaysInMonth(selectedYears, selectedMonth, "max");
  }, [selectedMonth, selectedYears]);

  // UI 표시용
  const yearRangeTitle = useMemo(() => {
    if (!selectedYears.length) return "(연도를 선택해주세요)";
    const minYear = Math.min(...selectedYears.map(Number));
    const maxYear = Math.max(...selectedYears.map(Number));
    return minYear === maxYear ? `${minYear}년` : `${minYear} ~ ${maxYear}년`;
  }, [selectedYears]);

  return (
    <section className="table-section">
      {loading && <p>로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="table-option">
        {/* 연도 선택 */}
        <div>
          <label> 연도 선택 : </label>
          <Select
            className="select-year"
            mode="multiple"
            value={selectedYears}
            onChange={(vals) => setSelectedYears(vals)}
            placeholder="연도 선택"
          >
            {availableYears.map((y) => (
              <Option key={y} value={y}>
                {y}
              </Option>
            ))}
          </Select>
        </div>

        {/* 항목 선택 */}
        <div>
          <label> 항목 선택 : </label>
          <Select
            className="select-category"
            mode="multiple"
            value={selectedMeasures}
            onChange={(vals) => setSelectedMeasures(vals)}
            maxTagCount={2}
            maxTagPlaceholder={(omittedValues) => `+${omittedValues.length} 항목`}
            placeholder="항목 선택"
          >
            {measureColumns.map((col) => (
              <Option key={col} value={col}>
                {col}
              </Option>
            ))}
          </Select>
        </div>

        {/* 합계/평균 */}
        <Radio.Group value={calcMode} onChange={(e) => setCalcMode(e.target.value)}>
          <Radio.Button value="sum">합계</Radio.Button>
          <Radio.Button value="avg">평균</Radio.Button>
        </Radio.Group>
      </div>

      {/* (A) 월별 테이블 */}
      <h4>
        {yearRangeTitle} {calcMode === "sum" ? "월별 합계" : "월별 평균"}
      </h4>
      <MonthlyTable
        selectedYears={selectedYears}
        selectedMeasures={selectedMeasures}
        monthlyStats={monthlyStats}
        onMonthClick={(m) => {
          setSelectedMonth(m);
          setSelectedDay(null);
        }}
      />

      {/* (B) 일별 테이블 */}
      {selectedMonth && (
        <div>
          <h4>
            {yearRangeTitle} {selectedMonth}월{" "}
            {calcMode === "sum" ? "일별 합계" : "일별 평균"}
          </h4>
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
        <>
          <h4>
            {yearRangeTitle} {selectedMonth}월 {selectedDay}일{" "}
            {calcMode === "sum" ? "시간별 합계" : "시간별 평균"}
          </h4>
          <HourlyTable
            selectedYears={selectedYears}
            selectedMeasures={selectedMeasures}
            hourlyStats={hourlyStats}
          />
        </>
      )}
    </section>
  );
}
