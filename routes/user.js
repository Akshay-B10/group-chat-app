const Router = require("express");

const router = Router();

const userController = require("../controllers/user");

router.get("/signup", userController.getSignUp);

router.post("/add", userController.addUser);

module.exports = router;