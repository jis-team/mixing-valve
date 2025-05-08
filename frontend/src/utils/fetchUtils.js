// ./src/utils/fetchUtils.js
export async function fetchRaw(params) {
    const port = process.env.REACT_APP_BACKEND_PORT;
    const baseUrl = `http://localhost:${port}`;
  
    const res = await fetch(`${baseUrl}/api/db/selectRaw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error("API 요청 실패");
    }

    const json = await res.json();
    if (!json.result) {
      throw new Error(json.error || "API Error");
    }

    return json.data;
  }

export async function fetchStats(params) {
  const port = process.env.REACT_APP_BACKEND_PORT;
  const baseUrl = `http://localhost:${port}`;

  const res = await fetch(`${baseUrl}/api/db/selectStats`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("API 요청 실패");
  }

  const json = await res.json();
  if (!json.result) {
    throw new Error(json.error || "API Error");
  }

  return json.data;
} 
  
  