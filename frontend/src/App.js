// App.js
import React from "react";
import { HashRouter, Routes, Route } from "react-router-dom"; // [추가]
import "./App.scss";

import SignInPage from "./pages/SignInPage";
import DashboardPage from "./pages/DashboardPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* 기본 라우트: 로그인 페이지 */}
        <Route path="/" element={<SignInPage />} />

        {/* 보호된 라우트 */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
