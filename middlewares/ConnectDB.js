const { sequelize } = require("../models");

module.exports = async (req, res, next) => {
  try {
    await sequelize.sync({ force: false });
  } catch (error) {
    console.log("Something went wrong", error);
    return res.status(500).send({
      status: 500,
      message: "Cannot connect to server",
      error: "Error in connecting to Database",
    });
  }
  next();
};
