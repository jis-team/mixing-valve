require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");

const app = express();
const backendPort = process.env.BACKEND_PORT;
const frontendPort = process.env.FRONTEND_PORT;

// 라우트 불러오기
const authRouter = require("./routes/auth");

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
      maxAge: 30 * 60 * 1000, // 30분
    },
  })
);

// 라우트
app.use("/api/auth", authRouter);

// 연결 확인
app.listen(backendPort, () => { console.log(`Server is running on http://localhost:${backendPort}`); });
