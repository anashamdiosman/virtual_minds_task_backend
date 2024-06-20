require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Response = require("./Response");
const { User: UserModel } = require("../models");
const { Op } = require("sequelize");

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

  signin = async ({ username, password, email }) => {
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
          process.env.JWT_ACCESS_TOKEN_SECRET
        );

        user.dataValues.token = jwtToken;
        return resolve(user);
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

  fetchUserEndPoint = async (req, res, next) => {
    const { username, email } = req.body;
    try {
      const lowerCaseUserName = username?.toLowerCase();

      const data = await this.fetchUserByUsernameOrEmail({
        username: lowerCaseUserName,
        email,
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
}

module.exports = User;
