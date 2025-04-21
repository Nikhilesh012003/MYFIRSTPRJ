const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");

router
  .route("/signup")
  .get(userController.renderSignupForm)
  .post(wrapAsync(userController.userSignup));

router
  .route("/login")
  .get(userController.userLoginForm)
  .post(
    saveRedirectUrl, // ACTUAL LOGIN HAPPENS WITH PASSPORT
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.userLogin
  );

router.get("/logout", userController.userLogout);

module.exports = router;
