// parseCsv.js
export async function parseCsv(csvUrl) {
    // CSV 파일 fetch
    const response = await fetch(csvUrl);
    const csvText = await response.text();
  
    // 각 줄로 분할
    const lines = csvText.trim().split("\n");
    if (lines.length <= 1) { return []; } // 헤더만 있거나, 비어있으면 빈 배열 반환
  
    // 헤더 파싱 (예: ["datetime", "a", "b", "c", ...])
    const header = lines[0].split(",").map((h) => h.trim());
  
    // 데이터 파싱
    const data = lines.slice(1).map((line) => {
      const values = line.split(",");
      const rowObj = {};
  
      header.forEach((colName, colIndex) => {
        const rawValue = values[colIndex]?.trim() || "";
  
        // "datetime" 컬럼이면 문자열로 저장
        // 그 외는 숫자로 파싱 (실제 CSV 구조에 맞게 조건 조정 가능)
        if (colName === "datetime") {
          rowObj[colName] = rawValue;
        } else {
          const parsed = parseFloat(rawValue);
          // parseFloat 실패 시 NaN 반환 → 필요 시 isNaN(parsed) 체크 후 0 할당
          rowObj[colName] = isNaN(parsed) ? 0 : parsed;
        }
      });
  
      return rowObj;
    });
  
    return data;
  }
  