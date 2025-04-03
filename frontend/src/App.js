import "./App.css";

import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import SignIn from "./pages/SignIn";
import DashBoard1 from "./pages/DashBoard1";
import DashBoard2 from "./pages/DashBoard2";
import RedirectError from "./pages/RedirectError";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <BrowserRouter>
          <Routes>
            {/* 로그인 페이지 */}
            <Route path="/" element={<SignIn />} />

            {/* 로그인 사용자를 위한 라우트 */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard1" element={<DashBoard1 />} />
              <Route path="/dashboard2" element={<DashBoard2 />} />
            </Route>

            {/* 존재하지 않는 경로 리다이렉트 */}
            <Route path="*" element={<RedirectError />} />
          </Routes>
        </BrowserRouter>
      </header>
    </div>
    // <div className="App">
    //   <header className="App-header">
    //     <SignIn />
    //   </header>
    // </div>
  );
}

export default App;
