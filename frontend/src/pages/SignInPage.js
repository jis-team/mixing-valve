// SignInPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../store/authSlice";
import { Form, Input, Button, message } from "antd";

const backendPort = process.env.REACT_APP_BACKEND_PORT;

export default function SignInPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // antd 폼 onFinish 콜백
  const onFinish = async (values) => {
    const { userId, userPwd } = values;
    try {
      const res = await fetch(`http://localhost:${backendPort}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userPwd }),
        credentials: "include", // 세션 쿠키
      });

      const data = await res.json();
      if (data.result) {
        dispatch(signInSuccess(data.user));
        navigate("/dashboard");
      } else {
        setError("로그인 실패. 아이디 또는 비밀번호를 확인하세요.");
        message.error("로그인 실패: 아이디/비밀번호 확인");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("서버 요청 중 에러가 발생했습니다.");
      message.error("서버 요청 중 에러가 발생했습니다.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "0 auto", marginTop: 80 }}>
      <h2>로그인</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="아이디"
          name="userId"
          rules={[{ required: true, message: "아이디를 입력해주세요." }]}
        >
          <Input placeholder="아이디" />
        </Form.Item>

        <Form.Item
          label="비밀번호"
          name="userPwd"
          rules={[{ required: true, message: "비밀번호를 입력해주세요." }]}
        >
          <Input.Password placeholder="비밀번호" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            로그인
          </Button>
        </Form.Item>
      </Form>
      
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
