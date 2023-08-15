const { Router } = require("express");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({
    storage: storage
})

const router = Router();

const userAuth = require("../middleware/auth");
const messageController = require("../controllers/message");

router.get("/get-all-new", userAuth.authenticate, messageController.getAllNewMessages);

router.post("/sent", userAuth.authenticate, messageController.sentMsg);

router.post("/send-multimedia", userAuth.authenticate, upload.single("file"), messageController.sendMultiMedia);
// router.post("/send-multimedia", upload.single("file"), userAuth.authenticate, messageController.sendMultiMedia);
// router.post("/send-multimedia", userAuth.authenticate, messageController.sendMultiMedia);

module.exports = router;