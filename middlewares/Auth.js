const { User } = require("../models");
const jwt = require("jsonwebtoken");

class Auth {
  findUserByUUID = ({ uuid }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const foundUser = await User.findOne({
          where: {
            uuid,
          },
        });
        if (!foundUser) return resolve(null);
        resolve(foundUser);
      } catch (error) {
        reject(error);
      }
    });
  };

  findUserByRefreshToken = ({ refresh_token }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const foundUser = await User.findOne({
          where: {
            refresh_token,
          },
        });

        if (!foundUser) return resolve(null);
        resolve(foundUser);
      } catch (error) {
        reject(error);
      }
    });
  };

  deleteUserRefreshToken = ({ refresh_token }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const foundUser = await this.findUserByRefreshToken({ refresh_token });
        if (!foundUser)
          return reject({ status: 404, message: "User not found" });

        await User.update(
          { refresh_token: null },
          { where: { uuid: foundUser?.dataValues?.uuid } }
        );

        resolve(1);
      } catch (error) {
        reject(error);
      }
    });
  };

  updateUserRefreshToken = ({ uuid, refresh_token }) => {
    return new Promise(async (resolve, reject) => {
      try {
        await User.update({ refresh_token }, { where: { uuid } });

        resolve(1);
      } catch (error) {
        reject(error);
      }
    });
  };

  authenticateToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.sendStatus(403);

      next();
    });
  };

  refreshToken = (req, res) => {
    try {
      const cookies = req.cookies;
      if (!cookies?.jwt) return res.sendStatus(401);

      const refresh_token = cookies.jwt;

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: false,
      });

      const foundUser = this.findUserByRefreshToken({ refresh_token });

      if (!foundUser) return res.sendStatus(403);

      jwt.verify(
        refresh_token,
        process.env.JWT_REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
          if (err || foundUser?.dataValues?.uuid !== decoded?.uuid)
            return res.status(403);

          const accessToken = jwt.sign(
            {
              uuid: decoded?.uuid,
            },
            process.env.JWT_ACCESS_TOKEN_SECRET,
            { expiresIn: "1d" }
          );

          const newRefreshToken = jwt.sign(
            { username: foundUser.username },
            process.env.JWT_REFRESH_TOKEN_SECRET,
            { expiresIn: "30d" }
          );

          await this.updateUserRefreshToken({
            uuid: decoded?.uuid,
            refresh_token: newRefreshToken,
          });

          res.cookie("jwt", newRefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 24 * 60 * 60 * 1000,
          });

          foundUser.dataValues.token = accessToken;

          return res.json({ foundUser });
        }
      );
    } catch (error) {
      return res.status(500).json({ message: "Something went wrong" });
    }
  };

  loginWithToken = async (req, res) => {
    try {
      const token = req.cookies.jwt;

      if (!token) return res.sendStatus(401);

      const user = await this.findUserByRefreshToken({ refresh_token: token });

      if (!user) return res.sendStatus(401);

      const decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);

      if (user?.dataValues?.uuid !== decoded?.uuid) return res.status(403);

      const accessToken = jwt.sign(
        {
          uuid: decoded?.uuid,
        },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      // await this.updateUserRefreshToken({
      //   uuid: decoded?.uuid,
      //   refresh_token: newRefreshToken,
      // });

      user.dataValues.token = accessToken;

      return res.json({ user });
    } catch (error) {
      console.log(error);
      if (error?.message === "jwt expired") return res.sendStatus(403);
      // console.log(error?.message);
      return res.status(500).json({ message: "Something went wrong" });
    }
  };

  authenticateUser = async (req, res, next) => {
    try {
      const token = req.cookies.jwt;

      if (!token) return res.sendStatus(401);

      const user = await this.findUserByRefreshToken({ refresh_token: token });

      req.vm_user = user;

      return next();
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "Something went wrong" });
    }
  };

  authenticateUserIsAdmin = async (req, res, next) => {
    try {
      if (!req?.headers?.authorization) {
        return res.status(403);
      }
      const accessToken = req?.headers?.authorization?.split(" ")?.[1];

      const decoded = jwt?.verify(
        accessToken,
        process.env.JWT_ACCESS_TOKEN_SECRET
      );

      const user = await this?.findUserByUUID({
        uuid: decoded?.uuid,
      });

      if (user?.dataValues?.role === "user") return res.sendStatus(401);

      if (user) {
        req.vm_user = user;
        return next();
      }
      // return res.sendStatus(403);
    } catch (error) {
      return res.sendStatus(403);
    }
  };

  AuthenticateUserMiddleware = async (req, res, next) => {
    try {
      // console.log(req.headers);
      if (!req?.headers?.authorization) {
        return res.status(403);
      }

      const accessToken = req?.headers?.authorization?.split(" ")?.[1];

      const decoded = jwt?.verify(
        accessToken,
        process.env.JWT_ACCESS_TOKEN_SECRET
      );

      const user = await this?.findUserByUUID({
        uuid: decoded?.uuid,
      });

      if (user) {
        req.vm_user = user;
        return next();
      }
      // return res.sendStatus(403);
    } catch (error) {
      return res.sendStatus(403);
    }
  };

  logoutUser = async (req, res) => {
    try {
      const jwt = req?.cookies?.jwt;
      if (!jwt) return res.sendStatus(200);
      await this.deleteUserRefreshToken({ refresh_token: jwt });

      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      res.clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
      });
      res.sendStatus(500);
    }
  };
}

module.exports = Auth;
