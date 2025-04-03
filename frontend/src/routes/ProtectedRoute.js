import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute() {
  const { isSignedIn } = useSelector((state) => state.auth);
  return isSignedIn ? <Outlet /> : <Navigate to="/" />;
}
