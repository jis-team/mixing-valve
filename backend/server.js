// ./server.js
require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");

const app = express();
const backendPort = process.env.BACKEND_PORT;
const frontendPort = process.env.FRONTEND_PORT;

// 라우트 불러오기
const authRouter = require("./router/auth");
const dbRouter = require("./router/db");

// CORS 설정
const corsOptions = {
  origin: `http://localhost:${frontendPort}`, // 프론트엔드 주소
  credentials: true,
};
app.use(cors(corsOptions));

// 미들웨어
app.use(express.json());

// 세션 설정
app.use(
  session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
    },
  })
);

// 라우트
app.use("/api/auth", authRouter); // 로그 인/아웃
app.use("/api/db", dbRouter); // DB SELECT

// 연결 확인
app.listen(backendPort, () => { console.log(`Server is running on http://localhost:${backendPort}`); });
