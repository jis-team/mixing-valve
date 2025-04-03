const express = require("express");
const app = express();
const port = 5000;
const bodyParser = require("body-parser");
const cors = require("cors");
const session = require("express-session");
const signin = require("./routes/signin");
const signout = require("./routes/signout");
require("dotenv").config();

app.use(bodyParser.json());

// CORS 설정
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// 세션 설정
app.use(
  session({
    secret: process.env.SESSION_KEY, // 비밀키는 환경변수로 관리하는 것이 좋습니다.
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true, // 클라이언트 JavaScript에서 쿠키에 접근하지 못하도록 설정
      maxAge: 30 * 60 * 1000, // 예: 30분 유지
    },
  })
);

app.use("/api/signin", signin);
app.use("/api/signout", signout);

// app.post("/signin", (req, res) => {
//   res.send("로그인 데이터!");
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
