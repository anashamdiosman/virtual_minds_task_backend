require("dotenv").config();
const express = require("express");
const app = express();

const { SERVER_PORT } = process.env;

const rootRouter = require("./routes/index");
const ConnectDB = require("./middlewares/ConnectDB");

app.use(express.json());

app.use(ConnectDB);

app.use("/vm-api/v1", rootRouter);

app.listen(SERVER_PORT, () =>
  console.log(`Server listening on port ${SERVER_PORT}`)
);
