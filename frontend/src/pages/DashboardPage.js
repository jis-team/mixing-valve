// DashboardPage.js
import React from "react";
import { useDispatch } from "react-redux";
import { signOutSuccess } from "../store/authSlice";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

import A from "./A";
import B from "./B";
import { Tabs } from "antd";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 단순 로컬 상태만 초기화
  const handleSignOut = () => {
    dispatch(signOutSuccess());
    navigate("/");
  };

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
        <div></div>
        <h1 style={{ margin: 0 }}>한국가스공사(KOGAS)</h1>
        <div>
          <Button onClick={handleSignOut} danger>
            로그아웃
          </Button>
        </div>
      </div>

      <div id="tab">
        <Tabs defaultActiveKey="a-tab" items={items} />
      </div>
    </div>
  );
}
