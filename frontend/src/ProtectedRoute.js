/** 로그인 상태를 체크하여, 인증되지 않은 사용자는
 * 로그인 페이지로 리다이렉트하는 컴포넌트
 */
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = () => {
  const isAuthenticated = useSelector((state) => state.auth.isSignedIn);
  console.log("isAuthenticated: ", isAuthenticated);

  return isAuthenticated ? <Outlet /> : <Navigate to="/" />;
};

export default ProtectedRoute;
