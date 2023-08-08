const Router = require("express");

const router = Router();

const userAuth = require("../middleware/auth");
const userController = require("../controllers/user");

router.get("/signup", userController.getSignUp);

router.get("/login", userController.getLogin);

router.post("/login-authenticate", userController.loginAuthenticate);

router.get("/index", userController.getIndex);

router.post("/add", userController.addUser);

router.get("/get-contacts", userAuth.authenticate, userController.getContacts);

module.exports = router;