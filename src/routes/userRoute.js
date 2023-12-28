const router = require("express").Router();
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { upload, multiUpload } = require("../utils/multer");
const passport = require("../configs/passportGoogle");

router.post("/signup", authController.signup);
// router.get("/login", authController.loginP);
// router.post("/loginuser", passport.authenticate("local", { failureRedirect: "/api/user/login" }), authController.login);
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/back' }), authController.authgoogle);
// router.get('/register', authController.register)
// router.get('/dashboard', authController.dashboard)
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);
router.get("/searchUser", userController.searchUsers);
router.get("/u/:username", userController.getUserByUsername);
router.get("/", userController.getUser);
router.get("/followings/:username", userController.getFollowings);
router.get("/allfollowings/:username", userController.getAllFollowings);
router.get("/followers/:username", userController.getFollowers);
router.put("/:id", upload, userController.updateUser);
router.put("/:id", authController.verify, upload, userController.updateUser);
router.put("/changepass/:id", authController.verify, userController.changePassword);
router.post("/sendotp/:id", authController.verify, userController.otpSendByEmail);
router.get("/verify/:id", authController.verify, userController.verifyOtp);
router.put("/:username/follow", authController.verify, userController.followUser);
router.put("/:username/unfollow", authController.verify, userController.unfollowUser);
router.get('/profile', userController.profileview)

module.exports = router;
