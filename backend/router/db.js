// ./router/db.js
const express = require("express");
const router = express.Router();
const db = require("../config/database");

router.get("/select/:tableName", async (req, res) => {
  const { tableName } = req.params;
  try {
    const [rows] = await db.query(`SELECT * FROM \`${tableName}\``);
    res.json({
      result: true,
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      result: false,
      error: String(err),
    });
  }
});

module.exports = router;
