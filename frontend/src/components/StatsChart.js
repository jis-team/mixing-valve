// ./src/components/StatsChart.js
import React, { useMemo } from "react";
import Chart from "react-apexcharts";

function useMissingShadedArea(categories, series) {
  return useMemo(() => {
    if (!categories?.length || !series?.length) return [];

    const dataCount = categories.length;
    const isMissing = Array(dataCount).fill(false);

    for (let i = 0; i < dataCount; i++) {
      for (const s of series) {
        const val = s.data[i];
        if (val === null || val === undefined) {
          isMissing[i] = true;
          break;
        }
      }
    }

    const xaxisAnnotations = [];
    let idx = 0;
    while (idx < dataCount) {
      if (isMissing[idx]) {
        const startIndex = idx;
        while (idx < dataCount && isMissing[idx]) {
          idx++;
        }
        const endIndex = idx - 1;

        if (startIndex >= 0 && endIndex < dataCount) {
          xaxisAnnotations.push({
            x: categories[startIndex],
            x2: categories[endIndex],
            fillColor: "rgba(255,0,0,0.2)",
            borderColor: "rgba(255,0,0,0.3)",
            opacity: 1,
          });
        }
      } else {
        idx++;
      }
    }

    return xaxisAnnotations;
  }, [categories, series]);
}

function StatsChart({ categories = [], series = [], height = 300 }) {
  const missingAreas = useMissingShadedArea(categories, series);
  const chartOptions = {
    chart: {
      type: "line",
      zoom: { enabled: true, allowMouseWheelZoom: false },
    },
    xaxis: { categories },
    stroke: { curve: "smooth" },
    annotations: {
      xaxis: missingAreas,
    },
  };

  return (
    <div className="chart">
      <Chart
        options={chartOptions}
        series={series}
        type="line"
        height={height}
      />
    </div>
  );
}

export default StatsChart;
