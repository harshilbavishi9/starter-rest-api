const router = require("express").Router();
const articleController = require("../controllers/articleController");
const authController = require("../controllers/authController");
const { multiUpload } = require("../utils/multer");

router.post("/", authController.verify, multiUpload,articleController.createArticle);
router.put("/:id", authController.verify, articleController.updateArticle);
router.delete("/:id", authController.verify, articleController.deleteArticle);
router.get("/timeline", authController.verify, articleController.getTimeline);
router.get("/u/:username", articleController.getArticlesUser);
router.get("/:id", articleController.getArticle);
router.get("/:id/like", authController.verify, articleController.likeUnlike);

module.exports = router;
