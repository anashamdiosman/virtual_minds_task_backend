require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const app = express();

const { SERVER_PORT } = process.env;

const rootRouter = require("./routes/index");
const ConnectDB = require("./middlewares/ConnectDB");

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.use(ConnectDB);

app.use("/vm-api/v1", rootRouter);

app.listen(SERVER_PORT, () =>
  console.log(`Server listening on port ${SERVER_PORT}`)
);
