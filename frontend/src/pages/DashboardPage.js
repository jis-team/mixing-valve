// DashboardPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOutSuccess } from "../store/authSlice";

import { Button } from "antd";

import A from "./A";
import B from "./B";
import { Tabs } from "antd";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 로그아웃
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

  // 탭
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

      {/* Tabs를 사용해 A/B 전환할 경우:*/}
      <div id="tab">
        <Tabs defaultActiveKey="a-tab" items={items} />
      </div>
      
    </div>
  );
}