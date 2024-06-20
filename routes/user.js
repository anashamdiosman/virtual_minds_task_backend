const express = require("express");
const router = express.Router();
const UserController = require("../controllers/User");
const UserInstance = new UserController();

router.post(
  "/signup",
  UserInstance?.signupEnpoint,
  UserInstance?.sendResponseStatusToUser
);

router.post(
  "/signin",
  UserInstance?.signinEnpoint,
  UserInstance?.sendResponseStatusToUser
);

router.post(
  "/fetch",
  UserInstance?.fetchUserEndPoint,
  UserInstance?.sendResponseStatusToUser
);

module.exports = router;
