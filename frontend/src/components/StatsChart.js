import React from "react";
import Chart from "react-apexcharts";

function StatsChart({ title, categories = [], series = [], height = 300 }) {
  const chartOptions = {
    chart: { type: "line" },
    xaxis: { categories },
    stroke: { curve: "smooth" },
  };

  return (
    <div>
      <h3>{title}</h3>
      <Chart options={chartOptions} series={series} type="line" height={height} />
    </div>
  );
}

export default StatsChart;
