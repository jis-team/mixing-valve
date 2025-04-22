// ./src/pages/DashboardPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOutSuccess } from "../store/authSlice";
import { Tabs, Button } from "antd";

import DetailPage from "./DetailPage";
import SummaryPage from "./SummaryPage";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 로그아웃 버튼
  const handleSignOut = async () => {
    try {
      const res = await fetch(`http://localhost:${process.env.REACT_APP_BACKEND_PORT}/api/auth/signout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        dispatch(signOutSuccess());
        navigate("/"); 
      }
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  // 세부항목 보기/숨기기
  const [showDetail, setShowDetail] = useState(false);

  // 탭
  const dataInfo = [
    { label: "에너지사용량", path: "./data/dummy_data_a.csv" },
    { label: "송출량", path: "./data/dummy_data_b.csv" },
    { label: "운용효율", path: "./data/dummy_data_c.csv" },
    { label: "히터라인 운용효율", path: "./data/dummy_data_d.csv" },
    { label: "라인별 동작시간", path: "./data/dummy_data_e.csv" },
    { label: "절체라인 추천", path: "./data/dummy_data_i.csv" },
  ]

  const tabItems = [
    { label: dataInfo[0]['label'], key: "a-tab", children: showDetail ? (<DetailPage csvPath={dataInfo[0]['path']} />) : null, },
    { label: dataInfo[1]['label'], key: "b-tab", children: showDetail ? (<DetailPage csvPath={dataInfo[1]['path']} />) : null, },
    { label: dataInfo[2]['label'], key: "c-tab", children: showDetail ? (<DetailPage csvPath={dataInfo[2]['path']} />) : null, },
    { label: dataInfo[3]['label'], key: "d-tab", children: showDetail ? (<DetailPage csvPath={dataInfo[3]['path']} />) : null, },
    { label: dataInfo[4]['label'], key: "e-tab", children: showDetail ? (<DetailPage csvPath={dataInfo[4]['path']} />) : null, },
    { label: dataInfo[5]['label'], key: "f-tab", children: showDetail ? (<DetailPage csvPath={dataInfo[5]['path']} />) : null, },
  ];

  const csvPaths = dataInfo.map((info) => info.path);

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
        <SummaryPage csvPaths={csvPaths}/>
      </div>

      <div className="line-1"></div>

      <div id="tab">
        <Tabs 
          defaultActiveKey="a-tab" 
          items={tabItems} 
          tabBarExtraContent={
            <Button onClick={() => setShowDetail((prev) => !prev)}>
              {showDetail ? "세부항목 숨기기" : "세부항목 보기"}
            </Button>
          }/>
      </div>
      
    </div>
  );
}