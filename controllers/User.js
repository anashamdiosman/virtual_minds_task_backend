require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Response = require("./Response");
const { User: UserModel } = require("../models");
const { Op } = require("sequelize");
const AuthController = require("../middlewares/Auth");
const Auth = new AuthController();

class User extends Response {
  constructor() {
    super();
  }

  endPointName = "user";

  saltRounds = 10;

  validateUserExists = async ({ username, email }) => {
    return new Promise(async (resolve, reject) => {
      try {
        let whereCondition = [];

        if (username) {
          whereCondition.push({ username });
        }

        if (email) {
          whereCondition.push({ email });
        }

        const userCount = await UserModel.count({
          where: {
            [Op.or]: whereCondition,
          },
        });

        if (!userCount) return resolve(null);

        return resolve(userCount);
      } catch (error) {
        return reject(error);
      }
    });
  };

  fetchUserByUsernameOrEmail = async ({ username, email }) => {
    return new Promise(async (resolve, reject) => {
      try {
        let whereCondition = [];

        if (username) {
          whereCondition.push({ username });
        }

        if (email) {
          whereCondition.push({ email });
        }

        const user = await UserModel.findOne({
          where: {
            [Op.or]: whereCondition,
          },
        });

        if (!user) return reject({ status: 404, message: "User not found" });

        return resolve(user);
      } catch (error) {
        return reject(error);
      }
    });
  };

  fetchUserByUUID = async ({ uuid }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await UserModel.findOne({
          where: {
            uuid,
          },
        });

        if (!user) return reject({ status: 404, message: "User not found" });

        return resolve(user);
      } catch (error) {
        return reject(error);
      }
    });
  };

  fetchAllUsers = async (limit, offset) => {
    return new Promise(async (resolve, reject) => {
      try {
        const users = await UserModel.findAndCountAll({
          limit: typeof limit === "number" ? limit : 10,
          offset,
        });
        return resolve(users);
      } catch (error) {
        return reject(error);
      }
    });
  };

  signup = async ({ first_name, last_name, email, username, password }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!first_name || !last_name || !email || !username || !password) {
          return reject({ status: 400, message: "All fields are required" });
        }

        const lowerCaseUserName = username?.toLowerCase();

        const userExists = await this.validateUserExists({
          username: lowerCaseUserName,
          email,
        });

        if (userExists)
          return reject({ status: 409, message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, this.saltRounds);

        const user = await UserModel.create({
          first_name,
          last_name,
          email,
          username: lowerCaseUserName,
          password: hashedPassword,
        });

        const jwtToken = jwt.sign(
          { uuid: user?.dataValues?.uuid },
          process.env.JWT_ACCESS_TOKEN_SECRET
        );

        user.dataValues.token = jwtToken;

        return resolve(user);
      } catch (error) {
        return reject(error);
      }
    });
  };

  signin = async ({ username, password }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!username || !password) {
          return reject({ status: 400, message: "All fields are required" });
        }

        const lowerCaseUserName = username?.toLowerCase();

        const user = await this.fetchUserByUsernameOrEmail({
          username: lowerCaseUserName,
        });

        if (!user) return reject({ status: 404, message: "User not found" });

        const matchPass = await bcrypt.compare(
          password,
          user?.dataValues?.password
        );

        if (!matchPass)
          return reject({ status: 404, message: "User not found" });

        const jwtToken = jwt.sign(
          { uuid: user?.dataValues?.uuid },
          process.env.JWT_ACCESS_TOKEN_SECRET,
          { expiresIn: "10s" }
        );

        user.dataValues.token = jwtToken;
        return resolve(user);
      } catch (error) {
        return reject(error);
      }
    });
  };

  deleteUser = async ({ username }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await UserModel.destroy({
          where: {
            username,
          },
        });

        if (!data) return reject({ status: 404, message: "User not found" });
        return resolve(data);
      } catch (error) {
        return reject(error);
      }
    });
  };

  deleteAccount = async ({ uuid }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await UserModel.destroy({
          where: {
            uuid,
          },
        });

        if (!data) return reject({ status: 404, message: "User not found" });
        return resolve(data);
      } catch (error) {
        return reject(error);
      }
    });
  };

  updateUser = async ({
    uuid,
    username,
    first_name,
    last_name,
    email,
    country_name,
    phone_numnber,
    date_of_birth,
  }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await UserModel.update(
          {
            first_name,
            last_name,
            email,
            username,
            country_name,
            phone_numnber,
            date_of_birth,
          },
          {
            where: {
              username,
            },
          }
        );

        if (!data) return reject({ status: 404, message: "User not found" });
        return resolve(data);
      } catch (error) {
        return reject(error);
      }
    });
  };

  updateUserByUUID = async ({
    uuid,
    username,
    first_name,
    last_name,
    email,
    country_name,
    phone_number,
    date_of_birth,
    password,
    role,
  }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await UserModel.update(
          {
            first_name,
            last_name,
            email,
            username,
            country_name,
            phone_number,
            date_of_birth,
            password,
            role,
          },
          {
            where: {
              uuid,
            },
          }
        );

        if (!data) return reject({ status: 404, message: "User not found" });
        return resolve(data);
      } catch (error) {
        return reject(error);
      }
    });
  };

  updateAccount = async ({
    uuid,
    username,
    first_name,
    last_name,
    email,
    role,
    country_name,
    phone_numnber,
    date_of_birth,
  }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await UserModel.update(
          {
            first_name,
            last_name,
            email,
            username,
            role,
            country_name,
            phone_numnber,
            date_of_birth,
          },
          {
            where: {
              uuid,
            },
          }
        );

        if (!data) return reject({ status: 404, message: "User not found" });
        return resolve(data);
      } catch (error) {
        return reject(error);
      }
    });
  };

  signupEnpoint = async (req, res, next) => {
    const { first_name, last_name, email, username, password } = req.body;

    try {
      const data = await this.signup({
        first_name,
        last_name,
        email,
        username,
        password,
      });

      if (!data) throw new Error({ message: "Something went wrong" });

      const refreshToken = jwt.sign(
        { uuid: data?.dataValues?.uuid },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: "10d" }
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000 * 30,
      });

      await Auth.updateUserRefreshToken({
        refresh_token: refreshToken,
        uuid: data?.dataValues?.uuid,
      });

      req.vm = this.prepareResponse({
        statusCode: 201,
        name: this?.endPointName,
        body: data,
        method: req?.method,
      });
    } catch (error) {
      req.vm = this.prepareResponse({
        statusCode: error?.status || 500,
        name: this?.endPointName,
        error: error?.message || error,
        method: req?.method,
      });
    } finally {
      next();
    }
  };

  signinEnpoint = async (req, res, next) => {
    const { username, password } = req.body;
    try {
      const data = await this.signin({
        password,
        username,
      });

      if (!data) throw new Error({ message: "Something went wrong" });

      const accessToken = jwt.sign(
        { uuid: data?.dataValues?.uuid },
        process.env.JWT_ACCESS_TOKEN_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { uuid: data?.dataValues?.uuid },
        process.env.JWT_REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000 * 30,
      });

      await Auth.updateUserRefreshToken({
        refresh_token: refreshToken,
        uuid: data?.dataValues?.uuid,
      });

      data.dataValues.token = accessToken;

      res.req.vm = this.prepareResponse({
        statusCode: 200,
        name: this?.endPointName,
        body: data,
        method: req?.method,
      });
    } catch (error) {
      req.vm = this.prepareResponse({
        statusCode: error?.status || 500,
        name: this?.endPointName,
        error: error?.message || error,
        method: req?.method,
      });
    } finally {
      next();
    }
  };

  fetchUserEndPoint = async (req, res, next) => {
    const { uuid } = req.body;
    try {
      if (!uuid) throw new Error({ message: "Something went wrong" });

      const data = await this.fetchUserByUUID({
        uuid,
      });

      if (!data) throw new Error({ message: "Something went wrong" });

      req.vm = this.prepareResponse({
        statusCode: 200,
        name: this?.endPointName,
        body: data,
        method: req?.method,
      });
    } catch (error) {
      req.vm = this.prepareResponse({
        statusCode: error?.status || 500,
        name: this?.endPointName,
        error: error?.message || error,
        method: req?.method,
      });
    } finally {
      next();
    }
  };

  fetchUsersEndPoint = async (req, res, next) => {
    const { limit = 10, page = 1 } = req.body;

    let offset = (page - 1) * limit;
    try {
      const data = await this.fetchAllUsers({
        limit,
        offset,
      });

      if (!data) throw new Error({ message: "Something went wrong" });

      req.vm = this.prepareResponse({
        statusCode: 200,
        name: this?.endPointName,
        body: data,
        method: req?.method,
      });
    } catch (error) {
      req.vm = this.prepareResponse({
        statusCode: error?.status || 500,
        name: this?.endPointName,
        error: error?.message || error,
        method: req?.method,
      });
    } finally {
      next();
    }
  };

  deleteUserEndPoint = async (req, res, next) => {
    const { uuid } = req.body;

    try {
      const data = await this.deleteAccount({
        uuid,
      });

      if (!data) throw new Error({ message: "Something went wrong" });

      req.vm = this.prepareResponse({
        statusCode: 200,
        name: this?.endPointName,
        body: data,
        method: req?.method,
      });
    } catch (error) {
      req.vm = this.prepareResponse({
        statusCode: error?.status || 500,
        name: this?.endPointName,
        error: error?.message || error,
        method: req?.method,
      });
    } finally {
      next();
    }
  };

  deleteAccountEndPoint = async (req, res, next) => {
    const { vm_user } = req;
    try {
      const data = await this.deleteAccount({
        uuid: vm_user?.dataValues?.uuid,
      });

      if (!data) throw new Error({ message: "Something went wrong" });

      req.vm = this.prepareResponse({
        statusCode: 200,
        name: this?.endPointName,
        body: data,
        method: req?.method,
      });
    } catch (error) {
      req.vm = this.prepareResponse({
        statusCode: error?.status || 500,
        name: this?.endPointName,
        error: error?.message || error,
        method: req?.method,
      });
    } finally {
      next();
    }
  };

  updateUserEndPoint = async (req, res, next) => {
    const {
      username,
      first_name,
      last_name,
      email,
      role,
      country_name,
      phone_number,
      date_of_birth,
      uuid,
      password,
    } = req.body;
    try {
      let newPassword;

      if (password) {
        newPassword = await bcrypt.hash(password, this.saltRounds);
      }
      const lowerCaseUserName = username?.toLowerCase();

      const data = await this.updateUserByUUID({
        username: lowerCaseUserName,
        first_name,
        last_name,
        email,
        role,
        country_name,
        phone_number,
        date_of_birth,
        uuid,
        password: newPassword,
      });

      if (!data) throw new Error({ message: "Something went wrong" });

      req.vm = this.prepareResponse({
        statusCode: 200,
        name: this?.endPointName,
        body: data,
        method: req?.method,
      });
    } catch (error) {
      req.vm = this.prepareResponse({
        statusCode: error?.status || 500,
        name: this?.endPointName,
        error: error?.message || error,
        method: req?.method,
      });
    } finally {
      next();
    }
  };

  updateAccountEndPoint = async (req, res, next) => {
    const {
      username,
      first_name,
      last_name,
      email,
      role,
      country_name,
      phone_number,
      date_of_birth,
      password,
    } = req.body;
    const { vm_user } = req;
    try {
      const lowerCaseUserName = username?.toLowerCase();
      let newPassword;

      if (password) {
        newPassword = await bcrypt.hash(password, this.saltRounds);
      }

      const data = await this.updateUserByUUID({
        uuid: vm_user?.dataValues?.uuid,
        username: lowerCaseUserName,
        first_name,
        last_name,
        email,
        role,
        country_name,
        phone_number,
        date_of_birth,
        password: newPassword,
      });

      if (!data) throw new Error({ message: "Something went wrong" });

      req.vm = this.prepareResponse({
        statusCode: 200,
        name: this?.endPointName,
        body: data,
        method: req?.method,
      });
    } catch (error) {
      console.log(error);
      req.vm = this.prepareResponse({
        statusCode: error?.status || 500,
        name: this?.endPointName,
        error: error?.message || error,
        method: req?.method,
      });
    } finally {
      next();
    }
  };
}

module.exports = User;
