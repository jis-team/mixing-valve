// ./src/components/SummaryTableSection.js
import React, { useEffect, useState, useMemo } from "react";
import { Table, DatePicker, Radio } from "antd";
import { useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import { fetchCsvData } from "../store/csvSlice";
import { computeYearMonthDayStats } from "../utils/calcStats";

export default function SummaryTableSection({ csvPaths = [] }) {
  const dispatch = useDispatch();
  const { csvMap, loadingMap, errorMap } = useSelector((state) => state.csv);

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [calcMode, setCalcMode] = useState("sum");

  // CSV 로드
  useEffect(() => {
    csvPaths.forEach((path) => {
      dispatch(fetchCsvData(path));
    });
  }, [csvPaths, dispatch]);

  // 로딩/에러
  const loading = csvPaths.some((p) => loadingMap[p]);
  const errorMsg = csvPaths.map((p) => errorMap[p]).filter(Boolean).join(" / ") || null;

  // “마지막 열”만 추출한 배열
  const measureDataArr = useMemo(() => {
    const result = [];
    for (let path of csvPaths) {
      const arr = csvMap[path] || [];
      if (!arr.length) continue;

      const headers = Object.keys(arr[0]);
      if (headers.length <= 1) continue;
      const lastCol = headers[headers.length - 1];

      const data = arr
        .filter((row) => row.datetime && row[lastCol] != null)
        .map((row) => ({
          datetime: row.datetime,
          value: row[lastCol],
        }));

      result.push({
        measureName: lastCol,
        data,
      });
    }
    return result;
  }, [csvMap, csvPaths]);

  // (연/월/일) 통계 계산
  const summaryResult = useMemo(() => {
    const res = {};
    measureDataArr.forEach((mObj) => {
      const { measureName, data } = mObj;
      const { yearVal, monthVal, dayVal } = computeYearMonthDayStats(
        data,
        selectedDate,
        calcMode
      );
      res[measureName] = { yearVal, monthVal, dayVal };
    });
    return res;
  }, [measureDataArr, selectedDate, calcMode]);

  // 테이블 데이터: 연/월/일 행 3개
  const tableData = useMemo(() => {
    const measureNames = measureDataArr.map((m) => m.measureName);

    const rowYear = { key: "year", note: calcMode === "sum" ? "연 합계" : "연 평균" };
    const rowMonth = { key: "month", note: calcMode === "sum" ? "월 합계" : "월 평균" };
    const rowDay = { key: "day", note: calcMode === "sum" ? "일 합계" : "일 평균" };

    measureNames.forEach((mn) => {
      const yVal = summaryResult[mn]?.yearVal;
      const mVal = summaryResult[mn]?.monthVal;
      const dVal = summaryResult[mn]?.dayVal;

      rowYear[mn] = yVal == null ? "" : yVal.toFixed(2);
      rowMonth[mn] = mVal == null ? "" : mVal.toFixed(2);
      rowDay[mn] = dVal == null ? "" : dVal.toFixed(2);
    });

    return [rowYear, rowMonth, rowDay];
  }, [summaryResult, measureDataArr, calcMode]);

  // 테이블 컬럼
  const columns = useMemo(() => {
    const measureNames = measureDataArr.map((m) => m.measureName);
    const baseCol = {
      title: "",
      dataIndex: "note",
      key: "note",
      fixed: "left",
      width: 100,
    };
    const measureCols = measureNames.map((mn) => ({
      title: mn,
      dataIndex: mn,
      key: mn,
      width: 120,
    }));
    return [baseCol, ...measureCols];
  }, [measureDataArr]);

  return (
    <section className="table-section">
      {loading && <p>로딩 중...</p>}
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      <div className="table-option" style={{ marginBottom: 20 }}>
        <div>
          <label> 날짜 선택 : </label>
          <DatePicker
            value={selectedDate}
            onChange={(date) => {
              if (date) setSelectedDate(date);
            }}
          />
        </div>

        <Radio.Group
          style={{ marginLeft: 30 }}
          value={calcMode}
          onChange={(e) => setCalcMode(e.target.value)}
        >
          <Radio.Button value="sum">합계</Radio.Button>
          <Radio.Button value="avg">평균</Radio.Button>
        </Radio.Group>
      </div>

      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        bordered
        scroll={{ x: "max-content" }}
      />
    </section>
  );
}