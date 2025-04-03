const express = require("express");
const router = express.Router();
// const mysql = require("mysql2/promise");
const db = require("../lib/server/database");

router.post("/", async (req, res) => {
  try {
    const { userId, userPwd } = req.body;

    const connection = await db;
    const [rows, fields] = await connection.query(
      "SELECT * FROM user_info WHERE id = ? AND pwd = ?",
      [userId, userPwd]
    );
    // console.log(rows);
    // console.log(fields);
    // console.log(rows.length);
    // console.log(rows[0].auth); // 0관리자 1 일반사용자
    // 아이디 비번 조회시 결과가 있으면
    if (rows.length === 1) {
      req.session.user = { id: userId, name: rows[0].name };
      res.status(200).json({ result: true, user: req.session.user });
    } else {
      res.status(401).json({ result: false, message: "인증 실패" });
    }
    //   return result;
  } catch (err) {
    console.error("Database connection failed:", err);
    throw err;
  }
});

// module.exports = userSearch;
module.exports = router;
