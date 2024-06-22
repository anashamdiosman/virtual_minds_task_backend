const express = require("express");
const router = express.Router();
const UserController = require("../controllers/User");
const UserInstance = new UserController();
const AuthController = require("../middlewares/Auth");
const AuthInstance = new AuthController();

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

router.post("/token", AuthInstance.loginWithToken);

router.post("/logout", AuthInstance?.logoutUser);

router.post(
  "/fetch",
  AuthInstance.authenticateUserIsAdmin,
  UserInstance?.fetchUserEndPoint,
  UserInstance?.sendResponseStatusToUser
);

router.post(
  "/fetch-all",
  AuthInstance.authenticateUserIsAdmin,
  UserInstance?.fetchUsersEndPoint,
  UserInstance?.sendResponseStatusToUser
);

router.delete(
  "/admin",
  AuthInstance.authenticateUserIsAdmin,
  UserInstance?.deleteUserEndPoint,
  UserInstance?.sendResponseStatusToUser
);

router.put(
  "/admin",
  AuthInstance.authenticateUserIsAdmin,
  UserInstance?.updateUserEndPoint,
  UserInstance?.sendResponseStatusToUser
);

router.delete(
  "/my-account",
  AuthInstance.AuthenticateUserMiddleware,
  UserInstance?.deleteAccountEndPoint,
  UserInstance?.sendResponseStatusToUser
);

router.put(
  "/my-account",
  AuthInstance.AuthenticateUserMiddleware,
  UserInstance?.updateAccountEndPoint,
  UserInstance?.sendResponseStatusToUser
);

module.exports = router;
