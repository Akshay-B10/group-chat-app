const { Router } = require("express");

const router = Router();

const userAuth = require("../middleware/auth");
const groupController = require("../controllers/group");

router.get("/get-all", userAuth.authenticate, groupController.getAllGroup);

router.post("/create", userAuth.authenticate, groupController.create);

module.exports = router;