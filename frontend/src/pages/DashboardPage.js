// ./src/pages/DashboardPage.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signOutSuccess } from "../store/authSlice";

import A from "./A";
import B from "./B";
import C from "./C";
import { Tabs, Button } from "antd";

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
    { label: "에너지사용량 (A)", key: "a-tab", children: <A />, },
    { label: "송출량 (B)", key: "b-tab", children: <B />, },
    { label: "운용효율 (C)", key: "c-tab", children: <C />, },
  ];

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

      <div id="tab">
        <Tabs defaultActiveKey="a-tab" items={items} />
      </div>
      
    </div>
  );
}