require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");

const app = express();
const port = 5000;

// 라우트 불러오기
const authRouter = require("./routes/auth");

// 미들웨어
app.use(express.json());

// CORS 설정
const corsOptions = {
  origin: "http://localhost:3000", // 프론트엔드 주소
  credentials: true,
};
app.use(cors(corsOptions));

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
