const { Router } = require("express");

const router = Router();

const userAuth = require("../middleware/auth");
const messageController = require("../controllers/message");

router.post("/sent", userAuth.authenticate, messageController.sentMsg);

module.exports = router;