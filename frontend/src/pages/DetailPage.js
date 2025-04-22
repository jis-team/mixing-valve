// ./src/pages/DetailPage.js
import React from "react";
import ChartSection from "../components/ChartSection";
import TableSection from "../components/TableSection";

export default function DetailPage({ tableName }) {
  return (
    <div className="row">
      <h2> 세부항목 실시간차트 </h2>
      <ChartSection tableName={tableName} />

      <div className="line-2"></div>

      <h2> 세부항목 통계 </h2>
      <TableSection tableName={tableName} />
    </div>
  );
}
