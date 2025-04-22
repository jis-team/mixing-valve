// ./src/components/StatsChart.js
import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";

export default function StatsChart({
  categories = [],
  series = [],
  height = NaN
}) {

  const option = useMemo(() => {
    if (!categories.length || !series.length) {
      return {
        title: { text: "Chart Loading ...", left: "center", top: "center"},
        xAxis: { type: "category", data: [] },
        yAxis: { type: "value" },
        series: []
      };
    }

    const echartsSeries = series.map((s) => ({
      name: s.name,
      type: "line",
      data: s.data,
      connectNulls: false,
      showSymbol: false
    }));

    return {
      legend: {
        show: true,
        bottom: 0
      },
      tooltip: {
        trigger: "axis"
      },
      xAxis: {
        type: "category",
        data: categories,
      },
      yAxis: {
        type: "value"
      },
      dataZoom: {
          type: "inside",
          realtime: true
      },
      toolbox: {
        show: true,
        feature: {
          dataView: {show: true},
          dataZoom: {show: true, yAxisIndex: 'none'},
        }
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: '10%',
        top: '10%',
        containLabel: true
      },
      series: echartsSeries
    };
  }, [categories, series]);

  return (
    <div style={{ width: "100%", height }}>
      <ReactECharts
        option={option}
        style={{ width: "100%", height: "100%" }}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}