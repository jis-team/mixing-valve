import React, { useState, useEffect } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material";
import Papa from "papaparse";
import CalcButtons from "./CalcButtons";

// =============================
// 1) CSV Data Fetch & Parse Hook
// =============================
function useCSVData(csvPath) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(csvPath)
      .then((response) => response.text())
      .then((csvText) => {
        const result = Papa.parse(csvText, { header: true, skipEmptyLines: true });
        // CSV를 파싱하여 필요한 정보(년/월/일/시, 숫자 변환 등) 추가
        const rows = result.data.map((row) => {
          const dateObj = new Date(row.datetime);
          return {
            ...row,
            dateObj,
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1, // JS는 0~11
            day: dateObj.getDate(),
            hour: dateObj.getHours(),
            a: parseFloat(row.a),
            b: parseFloat(row.b),
            c: parseFloat(row.c),
          };
        });
        setData(rows);
      })
      .catch((error) => {
        console.error("Error fetching CSV:", error);
      });
  }, [csvPath]);

  return data;
}

// =============================
// 2) 그룹화 & 합산 함수
// =============================
function groupAndSum(data, groupKey) {
  let groupKeys = [];
  if (groupKey === "year") {
    groupKeys = ["year"];
  } else if (groupKey === "month") {
    groupKeys = ["year", "month"];
  } else if (groupKey === "day") {
    groupKeys = ["year", "month", "day"];
  } else if (groupKey === "hour") {
    groupKeys = ["year", "month", "day", "hour"];
  }

  const groupMap = {};

  data.forEach((row) => {
    // 예: "2023" or "2023-1" or "2023-1-1" or "2023-1-1-0"
    const keyStr = groupKeys.map((k) => row[k]).join("-");
    if (!groupMap[keyStr]) {
      groupMap[keyStr] = {
        year: row.year,
        month: row.month,
        day: row.day,
        hour: row.hour,
        aSum: 0,
        bSum: 0,
        cSum: 0,
        count: 0,
      };
    }
    groupMap[keyStr].aSum += row.a || 0;
    groupMap[keyStr].bSum += row.b || 0;
    groupMap[keyStr].cSum += row.c || 0;
    groupMap[keyStr].count += 1;
  });

  // groupMap 객체를 배열 형태로 변환
  return Object.values(groupMap);
}

// =============================
// 3) 테이블 컴포넌트
// =============================
function AggregatedTable({ data, groupKey }) {
  const aggregatedData = groupAndSum(data, groupKey);

  // 어떤 열을 표시할지 결정
  const showYear = true; // 항상 연도 열은 표시
  const showMonth = groupKey !== "year";
  const showDay = groupKey === "day" || groupKey === "hour";
  const showHour = groupKey === "hour";

  return (
    <TableContainer component={Paper}>
      <Table size="small" aria-label="aggregated table">
        <TableHead>
          <TableRow>
            {showYear && <TableCell>Year</TableCell>}
            {showMonth && <TableCell>Month</TableCell>}
            {showDay && <TableCell>Day</TableCell>}
            {showHour && <TableCell>Hour</TableCell>}
            <TableCell align="right">A (Sum)</TableCell>
            <TableCell align="right">B (Sum)</TableCell>
            <TableCell align="right">C (Sum)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {aggregatedData.map((row, idx) => (
            <TableRow key={idx}>
              {showYear && <TableCell>{row.year}</TableCell>}
              {showMonth && <TableCell>{row.month}</TableCell>}
              {showDay && <TableCell>{row.day}</TableCell>}
              {showHour && <TableCell>{row.hour}</TableCell>}
              <TableCell align="right">{row.aSum.toFixed(2)}</TableCell>
              <TableCell align="right">{row.bSum.toFixed(2)}</TableCell>
              <TableCell align="right">{row.cSum.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// =============================
// 4) 메인 컴포넌트
// =============================
function A() {
  // 버튼 관련 상태
  const [selectedKey, setSelectedKey] = useState("year");
  const buttonKeys = ["year", "month", "day", "hour"];

  // CSV 데이터 로드 (커스텀 훅 사용)
  const parsedData = useCSVData("/data/dummy_data.csv");

  return (
    <section id="a">
      <h2>에너지사용량</h2>

      {/* 버튼 그룹 */}
      <Box sx={{ mb: 2 }}>
        <CalcButtons
          selectedKey={selectedKey}
          setSelectedKey={setSelectedKey}
          buttonKeys={buttonKeys}
        />
      </Box>

      {/* 그룹화 & 합산 결과를 테이블로 렌더링 */}
      <AggregatedTable data={parsedData} groupKey={selectedKey} />
    </section>
  );
}

export default A;
