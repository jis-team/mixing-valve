// ./src/utils/fetchDbTable.js
export async function fetchDbTable(tableName) {
    const port = process.env.REACT_APP_BACKEND_PORT;
    const baseUrl = `http://localhost:${port}`;
  
    const res = await fetch(`${baseUrl}/api/db/select/${tableName}`);
    if (!res.ok) {
      throw new Error("API 요청 실패");
    }

    const json = await res.json();
    if (!json.result) {
      throw new Error(json.error || "API Error");
    }

    return json.data;
  }
  