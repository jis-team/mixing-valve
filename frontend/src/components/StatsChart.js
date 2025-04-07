// StatsChart.js
import React from "react";
import Chart from "react-apexcharts";

function StatsChart({ categories = [], series = [], height = 300 }) {
  const chartOptions = {
    chart: { type: "line", zoom: { enabled: true, allowMouseWheelZoom: false }},
    xaxis: { categories },
    stroke: { curve: "smooth" },    
  };

  return (
    <div className="chart">
      <Chart options={chartOptions} series={series} type="line" height={height} />
    </div>
  );
}

export default StatsChart;
