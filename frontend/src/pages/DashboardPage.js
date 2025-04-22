// ./src/pages/DashboardPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOutSuccess } from "../store/authSlice";
import "@ant-design/v5-patch-for-react-19";
import { Tabs, Button } from "antd";

import DetailPage from "./DetailPage";
import SummaryPage from "./SummaryPage";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 로그아웃
  const handleSignOut = async () => {
    try {
      const res = await fetch(
        `http://localhost:${process.env.REACT_APP_BACKEND_PORT}/api/auth/signout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      if (res.ok) {
        dispatch(signOutSuccess());
        navigate("/");
      }
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  const [showDetail, setShowDetail] = useState(false);

  // MySQL 테이블 이름
  const dataInfo = [
    { label: "에너지사용량", tableName: "dummy_data_a" },
    { label: "송출량", tableName: "dummy_data_b" },
    { label: "운용효율", tableName: "dummy_data_c" },
    { label: "히터라인 운용효율", tableName: "dummy_data_d" },
  ];

  // 탭
  const tabItems = dataInfo.map((info) => ({
    label: info.label,
    key: info.tableName,
    children: showDetail ? <DetailPage tableName={info.tableName} /> : null,
  }));

  const tableNames = dataInfo.map((info) => info.tableName);

  return (
    <div>
      <div id="header">
        <div className="header-title">
          <p> 한국가스공사(KOGAS) </p>
        </div>
        <div className="header-button">
          <Button onClick={handleSignOut} danger>
            로그아웃
          </Button>
        </div>
      </div>

      <div id="summary">
        <SummaryPage tableNames={tableNames} />
      </div>

      <div className="line-1"></div>

      <div id="tab">
        <Tabs
          defaultActiveKey={dataInfo[0].tableName}
          items={tabItems}
          tabBarExtraContent={
            <Button onClick={() => setShowDetail((prev) => !prev)}>
              {showDetail ? "세부항목 숨기기" : "세부항목 보기"}
            </Button>
          }
        />
      </div>
    </div>
  );
}
