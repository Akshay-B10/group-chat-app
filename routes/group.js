const { Router } = require("express");

const router = Router();

const userAuth = require("../middleware/auth");
const groupController = require("../controllers/group");

router.get("/get-all", userAuth.authenticate, groupController.getAllGroup);

router.post("/create", userAuth.authenticate, groupController.create);

router.get("/get-details", userAuth.authenticate, groupController.getDetails);

router.get("/make-admin", groupController.makeAdmin);

router.get("/remove-member", groupController.removeMember);

router.post("/add-members", groupController.addMembers);

module.exports = router;