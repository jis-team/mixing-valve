// SignInPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signInSuccess } from "../store/authSlice";
import { Form, Input, Button, message } from "antd";

export default function SignInPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  // antd 폼 onFinish 콜백
  const onFinish = async (values) => {
    const { userId, userPwd } = values;

    // 하드코딩 아이디/비밀번호
    if (userId === "test" && userPwd === "test") {
      // 로그인 성공
      dispatch(signInSuccess({ userId: "test", name: "테스트사용자" }));
      navigate("/dashboard");
    } else {
      setError("로그인 실패. 아이디 또는 비밀번호를 확인하세요.");
      message.error("로그인 실패: 아이디/비밀번호 확인");
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
