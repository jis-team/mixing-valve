const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: "로그아웃 실패" });
    res.clearCookie("connect.sid"); // 기본 쿠키 이름
    res.status(200).json({ message: "로그아웃 성공" });
  });
});

module.exports = router;
