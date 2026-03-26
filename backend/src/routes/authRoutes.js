const express = require("express");
const router = express.Router();
const { getNonce } = require("../controllers/authController");

router.get("/nonce", getNonce);

module.exports = router;
