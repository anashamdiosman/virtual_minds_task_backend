require("dotenv").config();

// eslint-disable-next-line no-undef
const { DB_USERNAME, DB_PASS, DB_NAME, DB_HOST } = process.env;

const configuration = {
  development: {
    username: DB_USERNAME,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    dialect: "postgres",
    logging: false,
  },
  test: {
    username: DB_USERNAME,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    dialect: "postgres",
    logging: false,
  },
  production: {
    username: DB_USERNAME,
    password: DB_PASS,
    database: DB_NAME,
    host: DB_HOST,
    dialect: "postgres",
    logging: false,
  },
};
module.exports = configuration;
