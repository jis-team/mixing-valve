// 로그인 페이지
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { signin, signout } from "../reducer/authSlice";

// Renamed component to LoginModal (capitalized)
function LoginModal() {
  // const { singin } = useAuth();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [userid, setUserId] = useState("");
  const [userpwd, setUserPwd] = useState("");
  const [error, setError] = useState(null);

  // const { isSignedIn, user, signError } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("로그인 폼 전송");

    try {
      const res = await fetch("http://localhost:5000/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userid, userPwd: userpwd }),
      });

      const data = await res.json();
      console.log(data);
      if (data.result) {
        // signin 액션을 dispatch하여 로그인 처리
        dispatch(signin({ userid: data.user }));
        // 로그인 성공 후 이동
        navigate("/dashboard1");
      } else {
        setError("로그인 실패. 아이디 또는 비밀번호를 확인하세요.");
      }
    } catch (err) {
      console.error("Error", err);
    }
  };

  // // DB와 통신 후 로그인
  // const handleSignIn = () => {
  //   SignIn();
  //   navigate("/page1"); // 로그인 후 이동할 페이지 지정
  // };

  return (
    // <form method="POST" action="http://localhost:5000/signin">
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          로그인
          <input
            id="userId"
            name="userId"
            autoComplete="username"
            type="text"
            onChange={(e) => setUserId(e.target.value)}
            value={userid}
            placeholder="아이디"
          />
        </div>
        <div>
          비밀번호
          <input
            id="userPwd"
            name="userPwd"
            autoComplete="current-password"
            type="password"
            onChange={(e) => setUserPwd(e.target.value)}
            value={userpwd}
            placeholder="비밀번호"
          />
        </div>
        <button type="submit">로그인</button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

// Renamed the main component to SignIn (capitalized)
// and changed the state variable to isModalVisible for clarity.
export default function SignIn() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dispatch = useDispatch();
  const isSignedIn = useSelector((state) => state.auth.isSignedIn); // Redux 상태에서 로그인 상태 확인

  const handleButtonClick = () => {
    setIsModalVisible(true);
  };
  const handleSignOut = () => {
    dispatch(signout());
  };

  return (
    <div>
      {isSignedIn ? (
        <button onClick={handleSignOut}>로그아웃</button>
      ) : (
        <>
          {!isModalVisible && (
            <button onClick={handleButtonClick}>로그인 하기</button>
          )}
          {isModalVisible && <LoginModal />}
        </>
      )}
    </div>
  );
}
