// ./src/components/SummaryChartSection.js
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import "@ant-design/v5-patch-for-react-19";
import { DatePicker, Button } from "antd";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import StatsChart from "./StatsChart";
import { fetchTableData } from "../store/csvSlice";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

export default function SummaryChartSection({ tableNames = [] }) {
  const dispatch = useDispatch();
  const { csvMap, loadingMap, errorMap } = useSelector((state) => state.csv);

  // 여러 테이블 로드
  useEffect(() => {
    tableNames.forEach((tableName) => {
      dispatch(fetchTableData(tableName));
    });
  }, [tableNames, dispatch]);

  // 로딩/에러
  const loading = tableNames.some((tn) => loadingMap[tn]);
  const error = tableNames.map((tn) => errorMap[tn]).filter(Boolean).join(" / ") || null;

  // 기간 필터
  const defaultStart = dayjs().subtract(6, "day");
  const defaultEnd = dayjs();
  const [startDate, setStartDate] = useState(defaultStart.format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(defaultEnd.format("YYYY-MM-DD"));

  // 차트 표시 여부
  const [showChart, setShowChart] = useState(true);

  // "마지막 열"만 추출: tableNames → datasets
  // datasets = [ { measureName, data: [{datetime, value}, ...]}, ... ]
  const datasets = useMemo(() => {
    const resultArr = [];
    for (let tblName of tableNames) {
      const arr = csvMap[tblName] || [];
      if (!arr.length) continue;
      const headers = Object.keys(arr[0]);
      if (headers.length <= 1) continue;
      const lastCol = headers[headers.length - 1];

      const items = arr
        .filter((row) => row.datetime && row[lastCol] != null)
        .map((row) => ({
          datetime: row.datetime,
          value: row[lastCol],
        }));

      resultArr.push({
        measureName: lastCol,
        data: items,
      });
    }
    return resultArr;
  }, [tableNames, csvMap]);

  // 기간 필터링
  const filteredDatasets = useMemo(() => {
    const start = dayjs(startDate);
    const end = dayjs(endDate);

    return datasets.map((ds) => {
      const filtered = ds.data.filter((item) => {
        const dt = dayjs(item.datetime);
        return dt.isValid() && dt.isSameOrAfter(start) && dt.isSameOrBefore(end);
      });
      return { measureName: ds.measureName, data: filtered };
    });
  }, [datasets, startDate, endDate]);

  // 차트 데이터 구성
  const { chartCategories, chartSeries } = useMemo(() => {
    if (!filteredDatasets.length) {
      return { chartCategories: [], chartSeries: [] };
    }

    // 모든 datetime 합집합
    let allTimes = new Set();
    filteredDatasets.forEach((ds) => {
      ds.data.forEach((item) => {
        allTimes.add(item.datetime);
      });
    });
    let allTimesSorted = Array.from(allTimes).sort(
      (a, b) => dayjs(a).valueOf() - dayjs(b).valueOf()
    );

    const seriesArr = filteredDatasets.map((ds) => {
      const mapVal = new Map(ds.data.map((x) => [x.datetime, x.value]));
      const dataArr = allTimesSorted.map((t) =>
        mapVal.has(t) ? +mapVal.get(t).toFixed(2) : null
      );
      return {
        name: ds.measureName,
        data: dataArr,
      };
    });

    const categories = allTimesSorted.map((t) => dayjs(t).format("MM-DD HH:mm"));
    return { chartCategories: categories, chartSeries: seriesArr };
  }, [filteredDatasets]);

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
