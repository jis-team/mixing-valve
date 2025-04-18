// ./src/components/ChartSection.js
import React, { useState, useEffect, useMemo } from "react";
import "@ant-design/v5-patch-for-react-19";
import { DatePicker, Button } from "antd";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import StatsChart from "./StatsChart";
import useStats from "../hooks/useStats";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

export default function ChartSection({ csvPath }) {
  const { 
    loading, 
    error, 
    measureColumns, 
    rawData 
  } = useStats(csvPath);

  const defaultStart = dayjs().subtract(6, "day"); // 7일 전
  const defaultEnd = dayjs();                     // 오늘

  const [startDate, setStartDate] = useState(defaultStart.format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(defaultEnd.format("YYYY-MM-DD"));

  const [selectedMeasures, setSelectedMeasures] = useState([]);
  useEffect(() => {
    if (measureColumns.length > 0 && selectedMeasures.length === 0) {
      setSelectedMeasures(measureColumns);
    }
  }, [measureColumns, selectedMeasures]);

  const [showChart, setShowChart] = useState(true);

  const filteredData = useMemo(() => {
    if (!rawData || !rawData.length) return [];
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    return rawData.filter((item) => {
      if (!item.datetime) return false;
      const dt = dayjs(item.datetime);
      return dt.isValid() && (dt.isSameOrAfter(start) && dt.isSameOrBefore(end));
    });
  }, [rawData, startDate, endDate]);

  const { chartCategories, chartSeries } = useMemo(() => {
    if (!filteredData.length || !selectedMeasures.length) {
      return { chartCategories: [], chartSeries: [] };
    }

    // 1) 데이터 정렬: datetime 오름차순
    const sorted = [...filteredData].sort((a, b) => {
      const tA = new Date(a.datetime).getTime();
      const tB = new Date(b.datetime).getTime();
      return tA - tB;
    });

    // 2) x축: 문자열(분 단위)
    const categories = sorted.map(item => {
      const dObj = dayjs(item.datetime);
      return dObj.format("MM-DD HH:mm");
    });

    // 3) 시리즈: selectedMeasures × sorted.length
    const series = selectedMeasures.map((col) => {
      const dataArr = sorted.map(item => {
        const val = item[col];
        return (typeof val === "number") ? +val.toFixed(2) : null;
      });
      return { name: col, data: dataArr };
    });

    return { chartCategories: categories, chartSeries: series };
  }, [filteredData, selectedMeasures]);

  return (
    <section className="chart-section">
      {loading && <p>데이터 로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="chart-option">
        <div className="select-date-range">
          <label> 기간 선택 : </label>
          <RangePicker
            defaultValue={[defaultStart, defaultEnd]}
            format="YYYY-MM-DD"
            onChange={(dates) => {
              if (!dates || dates.length < 2) return;
              setStartDate(dates[0].format("YYYY-MM-DD"));
              setEndDate(dates[1].format("YYYY-MM-DD"));
            }}
          />
        </div>

        <Button onClick={() => setShowChart(prev => !prev)}>
          {showChart ? "차트 숨기기" : "차트 보기"}
        </Button>
      </div>

      {showChart && (
        <StatsChart
          categories={chartCategories}
          series={chartSeries}
          height={400}
        />
      )}
    </section>
  );
}
