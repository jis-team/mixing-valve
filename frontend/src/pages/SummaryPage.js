// ./src/pages/SummaryPage.js
import React from "react";
import SummaryChartSection from "../components/SummaryChartSection";
import SummaryTableSection from "../components/SummaryTableSection";

export default function SummaryPage({ tableNames = [] }) {
  return (
    <div className="row">
      <h2> 전체항목 실시간차트 </h2>
      <SummaryChartSection tableNames={tableNames} />

      <div className="line-2"></div>

      <h2> 전체항목 통계 </h2>
      <SummaryTableSection tableNames={tableNames} />
    </div>
  );
}
