// ./src/pages/DetailPage.js
import TableSection from "../components/TableSection";
import ChartSection from "../components/ChartSection";

export default function DetailPage({ csvPath }) {

  return (
    <div className="row">
      
      <h2> 세부항목 실시간차트 </h2>
      <ChartSection csvPath={csvPath} />

      <div className="line-2"> </div>
      
      <h2> 세부항목 통계 </h2>
      <TableSection csvPath={csvPath} />
      
    </div>
  );
}
