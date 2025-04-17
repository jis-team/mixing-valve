// ./src/utils/parseCsv.js
export async function parseCsv(csvUrl) {
  const response = await fetch(csvUrl);
  const csvText = await response.text();

  const lines = csvText.trim().split("\n");
  if (lines.length <= 1) {
    return [];
  }

  const header = lines[0].split(",").map((h) => h.trim());

  const data = lines.slice(1).map((line) => {
    const values = line.split(",");
    const rowObj = {};

    header.forEach((colName, colIndex) => {
      const rawValue = values[colIndex]?.trim() || "";

      if (colName === "datetime") {
        rowObj[colName] = rawValue;
      } else {
        // 빈 문자열 또는 parseFloat 실패 시 null
        if (rawValue === "") {
          rowObj[colName] = null;
        } else {
          const parsed = parseFloat(rawValue);
          rowObj[colName] = isNaN(parsed) ? null : parsed;
        }
      }
    });

    return rowObj;
  });

  return data;
}
