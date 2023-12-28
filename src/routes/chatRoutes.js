const router = require("express").Router();
const chatController = require("../controllers/chatController");

router.get("/",chatController.chat);
router.post('/add_chat', chatController.AddChat);


module.exports = router;
