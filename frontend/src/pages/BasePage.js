// ./src/pages/BasePage.js
import TableSection from "../components/TableSection";
import ChartSection from "../components/ChartSection";

export default function BasePage({ csvPath }) {

  return (
    <div className="row">
      
      <h2> 실 시 간 차 트 </h2>
      <ChartSection csvPath={csvPath} />

      <div className="line"> </div>
      
      <h2> 과 거 통 계 </h2>
      <TableSection csvPath={csvPath} />
      
    </div>
  );
}
