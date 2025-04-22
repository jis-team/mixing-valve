// ./src/components/ChartSection.js
import React, { useEffect, useMemo, useState } from "react";
import "@ant-design/v5-patch-for-react-19";
import { DatePicker, Button } from "antd";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useDispatch, useSelector } from "react-redux";

import StatsChart from "./StatsChart";
import { fetchCsvData } from "../store/csvSlice";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

export default function ChartSection({ csvPath }) {
  const dispatch = useDispatch();
  const { csvMap, loadingMap, errorMap } = useSelector((state) => state.csv);

  useEffect(() => {
    if (csvPath) {
      dispatch(fetchCsvData(csvPath));
    }
  }, [csvPath, dispatch]);

  // 로드 결과
  const rawData = csvMap[csvPath] || []; 
  const loading = loadingMap[csvPath] || false; 
  const error = errorMap[csvPath] || null;

  // 기간 필터
  const defaultStart = dayjs().subtract(6, "day");
  const defaultEnd = dayjs();
  const [startDate, setStartDate] = useState(defaultStart.format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(defaultEnd.format("YYYY-MM-DD"));

  // 차트 표시 여부
  const [showChart, setShowChart] = useState(true);

  // rawData 필터링
  const filteredData = useMemo(() => {
    if (!rawData.length) return [];
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    return rawData.filter((item) => {
      if (!item.datetime) return false;
      const dt = dayjs(item.datetime);
      return dt.isValid() && dt.isSameOrAfter(start) && dt.isSameOrBefore(end);
    });
  }, [rawData, startDate, endDate]);

  // 차트 데이터 준비
  const { chartCategories, chartSeries } = useMemo(() => {
    if (!filteredData.length) {
      return { chartCategories: [], chartSeries: [] };
    }
    // 1) 시간 오름차순 정렬
    const sorted = [...filteredData].sort((a, b) => {
      return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
    });
    // 2) x축
    const categories = sorted.map((item) => dayjs(item.datetime).format("MM-DD HH:mm"));
    // 3) 모든 측정 컬럼명 추출 (datetime 제외)
    const measureCols = Object.keys(sorted[0]).filter((k) => k !== "datetime");
    // 4) series 생성
    const series = measureCols.map((col) => {
      const dataArr = sorted.map((item) => {
        const val = item[col];
        return typeof val === "number" ? +val.toFixed(2) : null;
      });
      return { name: col, data: dataArr };
    });
    return { chartCategories: categories, chartSeries: series };
  }, [filteredData]);

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

        <Button onClick={() => setShowChart((prev) => !prev)}>
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