// DashboardPage.js
import React from "react";
import { Tabs } from "antd";
import A from "./A";
import B from "./B";

export default function DashboardPage() {
  const items = [
    {
      label: "에너지사용량 (A)",
      key: "a-tab",
      children: <A />,
    },
    {
      label: "송출량 (B)",
      key: "b-tab",
      children: <B />,
    },
  ];

  return (
    <div>
      <div id="header">
        <h1>한국가스공사(KOGAS)</h1>
      </div>

      <div id="page">
        <Tabs defaultActiveKey="a-tab" items={items} />
      </div>
    </div>
  );
}
