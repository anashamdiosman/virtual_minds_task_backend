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

router.delete(
  "/admin",
  UserInstance?.deleteUserEndPoint,
  UserInstance?.sendResponseStatusToUser
);

router.update(
  "/admin",
  UserInstance?.updateUserEndPoint,
  UserInstance?.sendResponseStatusToUser
);

router.delete(
  "/my-account",
  UserInstance?.deleteAccountEndPoint,
  UserInstance?.sendResponseStatusToUser
);

router.update(
  "/my-account",
  UserInstance?.updateAccountEndPoint,
  UserInstance?.sendResponseStatusToUser
);

module.exports = router;
