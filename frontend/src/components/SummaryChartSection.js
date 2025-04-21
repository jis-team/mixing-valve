// ./src/components/SummaryChartSection.js
import React, { useEffect, useState, useMemo } from "react";
import "@ant-design/v5-patch-for-react-19";
import { DatePicker, Button } from "antd";

import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

import StatsChart from "./StatsChart";
import { parseCsv } from "../utils/parseCsv";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

export default function SummaryChartSection({ csvPaths = [] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datasets, setDatasets] = useState([]);

  // 기간 필터 (디폴트: 최근 7일)
  const defaultStart = dayjs().subtract(6, "day");
  const defaultEnd = dayjs();
  const [startDate, setStartDate] = useState(defaultStart.format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(defaultEnd.format("YYYY-MM-DD"));

  // 차트 표시 여부
  const [showChart, setShowChart] = useState(true);

  // CSV 로드 (처음 한 번)
  useEffect(() => {
    if (!csvPaths.length) return;

    (async () => {
      setLoading(true);
      try {
        const resultArr = [];
        for (let path of csvPaths) {
          const csvData = await parseCsv(path);
          if (!csvData || csvData.length === 0) continue;
          // 마지막 열 이름
          const headers = Object.keys(csvData[0]);
          const lastCol = headers[headers.length - 1];
          // 해당 열의 데이터만 추출
          const items = csvData
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
        setDatasets(resultArr);
      } catch (err) {
        console.error(err);
        setError("CSV 로드 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    })();
  }, [csvPaths]);

  // 기간에 맞게 필터링
  const filteredDatasets = useMemo(() => {
    if (!datasets.length) return [];

    const start = dayjs(startDate);
    const end = dayjs(endDate);

    return datasets.map((ds) => {
      const filtered = ds.data.filter((item) => {
        const dt = dayjs(item.datetime);
        return dt.isValid() && dt.isSameOrAfter(start) && dt.isSameOrBefore(end);
      });
      return {
        measureName: ds.measureName,
        data: filtered,
      };
    });
  }, [datasets, startDate, endDate]);

  const { chartCategories, chartSeries } = useMemo(() => {
    if (!filteredDatasets || !filteredDatasets.length) {
      return { chartCategories: [], chartSeries: [] };
    }

    let allDatetimes = new Set();
    filteredDatasets.forEach((ds) => {
      ds.data.forEach((item) => {
        allDatetimes.add(item.datetime);
      });
    });
    let allTimesSorted = Array.from(allDatetimes).sort(
      (a, b) => dayjs(a).valueOf() - dayjs(b).valueOf()
    );

    const seriesArr = filteredDatasets.map((ds) => {
      const valueMap = new Map(
        ds.data.map((item) => [item.datetime, item.value])
      );
      const dataArr = allTimesSorted.map((t) =>
        valueMap.has(t) ? +valueMap.get(t).toFixed(2) : null
      );

      return {
        name: ds.measureName,
        data: dataArr,
      };
    });

    const categories = allTimesSorted.map((t) => dayjs(t).format("MM-DD HH:mm"));

    return {
      chartCategories: categories,
      chartSeries: seriesArr,
    };
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
