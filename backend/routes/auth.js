const express = require("express");
const router = express.Router();
const db = require("../config/database");

// 로그인
router.post("/signin", async (req, res) => {
  try {
    const { userId, userPwd } = req.body;

    const [rows] = await db.query(
      "SELECT * FROM user_info WHERE id = ? AND pwd = ?",
      [userId, userPwd]
    );

    // 일치하는 사용자 정보가 있으면 세션에 저장
    if (rows.length === 1) {
      req.session.user = {
        id: rows[0].id,
        name: rows[0].name,
        // rows[0].auth 등 필요한 정보 추가
      };
      return res.status(200).json({
        result: true,
        user: req.session.user, // 프론트엔드에서 user.id, user.name 등에 접근 가능
      });
    }

    // 로그인 실패
    return res.status(401).json({ result: false, message: "인증 실패" });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ result: false, message: "서버 오류" });
  }
});

// 로그아웃
router.post("/signout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "로그아웃 실패" });
    }
    res.clearCookie("connect.sid"); // 세션 쿠키 제거
    return res.status(200).json({ message: "로그아웃 성공" });
  });
});

module.exports = router;
