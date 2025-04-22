// ./src/pages/SummaryPage.js
import SummaryChartSection from "../components/SummaryChartSection";
import SummaryTableSection from "../components/SummaryTableSection";

export default function SummaryPage({ csvPaths = [] }) {

  return (
    <div className="row">

      <h2> 전체항목 실시간차트 </h2>
      <SummaryChartSection csvPaths={csvPaths}/>

      <div className="line-2"></div>

      <h2> 전체항목 통계 </h2>
      <SummaryTableSection csvPaths={csvPaths}/>

    </div>
  );
}