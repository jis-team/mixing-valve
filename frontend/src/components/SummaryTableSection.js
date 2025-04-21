// ./src/components/SummaryTableSection.js
import React, { useEffect, useState, useMemo } from "react";
import { Table, DatePicker, Radio } from "antd";
import { parseCsv } from "../utils/parseCsv";
import dayjs from "dayjs";

export default function SummaryTableSection({ csvPaths = [] }) {
  const [measureDataArr, setMeasureDataArr] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [calcMode, setCalcMode] = useState("sum");

  // CSV 로드
  useEffect(() => {
    if (!csvPaths.length) return;
    
    (async () => {
      try {
        const tempArr = [];
        for (let path of csvPaths) {
          const parsed = await parseCsv(path);
          if (!parsed || !parsed.length) continue;

          // 마지막 열 찾기
          const headers = Object.keys(parsed[0]);
          const lastCol = headers[headers.length - 1];

          // 데이터 추출
          const arr = parsed
            .filter((row) => row.datetime && row[lastCol] != null)
            .map((row) => ({
              datetime: row.datetime,
              value: row[lastCol],
            }));

          tempArr.push({
            measureName: lastCol,
            data: arr,
          });
        }
        setMeasureDataArr(tempArr);
      } catch (err) {
        console.error("Summary table CSV 로드 오류:", err);
      }
    })();
  }, [csvPaths]);

  const selectedYear = useMemo(() => selectedDate.year(), [selectedDate]);
  const selectedMonth = useMemo(() => selectedDate.month() + 1, [selectedDate]);
  const selectedDay = useMemo(() => selectedDate.date(), [selectedDate]);

  const summaryResult = useMemo(() => {
    const result = {};
    measureDataArr.forEach((mObj) => {
      const { measureName, data } = mObj;
      let yearSum = 0,
        yearCount = 0;
      let monthSum = 0,
        monthCount = 0;
      let daySum = 0,
        dayCount = 0;

      data.forEach((item) => {
        const d = dayjs(item.datetime);
        if (!d.isValid()) return;

        const y = d.year();
        const m = d.month() + 1;
        const dd = d.date();

        // 연도 필터
        if (y === selectedYear) {
          yearSum += item.value;
          yearCount++;
          // 월 필터
          if (m === selectedMonth) {
            monthSum += item.value;
            monthCount++;
            // 일 필터
            if (dd === selectedDay) {
              daySum += item.value;
              dayCount++;
            }
          }
        }
      });

      const yearVal = yearCount === 0 ? null : calcMode === "sum" ? yearSum : yearSum / yearCount;
      const monthVal = monthCount === 0 ? null : calcMode === "sum" ? monthSum : monthSum / monthCount;
      const dayVal = dayCount === 0 ? null : calcMode === "sum" ? daySum : daySum / dayCount;

      result[measureName] = { yearVal, monthVal, dayVal };
    });
    return result;
  }, [measureDataArr, selectedYear, selectedMonth, selectedDay, calcMode]);

  const tableData = useMemo(() => {
    const measureNames = measureDataArr.map((m) => m.measureName);

    // 연별통계
    const rowYear = { key: "year", note: calcMode === "sum" ? "연 합계" : "연 평균" };
    measureNames.forEach((mn) => {
      const val = summaryResult[mn]?.yearVal;
      rowYear[mn] = val == null ? "" : val.toFixed(2);
    });

    // 월별통계
    const rowMonth = { key: "month", note: calcMode === "sum" ? "월 합계" : "월 평균" };
    measureNames.forEach((mn) => {
      const val = summaryResult[mn]?.monthVal;
      rowMonth[mn] = val == null ? "" : val.toFixed(2);
    });

    // 일별통계
    const rowDay = { key: "day", note: calcMode === "sum" ? "일 합계" : "일 평균" };
    measureNames.forEach((mn) => {
      const val = summaryResult[mn]?.dayVal;
      rowDay[mn] = val == null ? "" : val.toFixed(2);
    });

    return [rowYear, rowMonth, rowDay];
  }, [measureDataArr, summaryResult]);

  // 컬럼 정의
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
      <div className="table-option">
        <div>
          <label> 날짜 선택 : </label>
          <DatePicker
            value={selectedDate}
            onChange={(date) => {
              if (date) setSelectedDate(date);
            }}
          />
        </div>

        <Radio.Group value={calcMode} onChange={(e) => setCalcMode(e.target.value)}>
          <Radio.Button value="sum">합계</Radio.Button>
          <Radio.Button value="avg">평균</Radio.Button>
        </Radio.Group>
      </div>

      <div className="table-section">
        <Table
          columns={columns}
          dataSource={tableData}
          pagination={false}
          bordered
          scroll={{ x: "max-content" }}
        />
      </div>

    </section>
  );
}
