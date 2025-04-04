import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signInSuccess, signOutSuccess } from "../store/authSlice";

const backendPort = process.env.BACKEND_PORT;

function SignInForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userId, setUserId] = useState("");
  const [userPwd, setUserPwd] = useState("");
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:${backendPort}/api/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, userPwd }),
        credentials: "include", // 세션 쿠키 수신
      });

      const data = await res.json();
      if (data.result) {
        // Redux에 로그인 성공 상태 반영
        dispatch(signInSuccess(data.user));
        navigate("/dashboard");
      } else {
        setError("로그인 실패. 아이디 또는 비밀번호를 확인하세요.");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("서버 요청 중 에러가 발생했습니다.");
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <form onSubmit={handleSignIn}>
        <div>
          <label>아이디</label>
          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="아이디"
          />
        </div>
        <div>
          <label>비밀번호</label>
          <input
            type="password"
            value={userPwd}
            onChange={(e) => setUserPwd(e.target.value)}
            placeholder="비밀번호"
          />
        </div>
        <button type="submit">로그인</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default function SignInPage() {
  const [showForm, setShowForm] = useState(false);
  const dispatch = useDispatch();
  const { isSignedIn } = useSelector((state) => state.auth);

  const handleOpenForm = () => setShowForm(true);
  const handleSignOut = async () => {
    try {
      const res = await fetch(`http://localhost:${backendPort}/api/auth/signout`, {
        method: "POST",
        credentials: "include", // 세션 쿠키
      });
      if (res.ok) {
        dispatch(signOutSuccess());
      }
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  return (
    <div>
      {isSignedIn ? (
        <button onClick={handleSignOut}>로그아웃</button>
      ) : (
        <>
          {!showForm && <button onClick={handleOpenForm}>로그인 하기</button>}
          {showForm && <SignInForm />}
        </>
      )}
    </div>
  );
}
