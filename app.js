require("dotenv").config();
require("express-async-errors");

const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");

const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const orderRouter = require("./routes/orderRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const rateLimiter = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");

const port = process.env.PORT || 5000;

//rest of the packages
const morgan = require("morgan");
//database
const connectDB = require("./db/connect");

//middleware
const notFoundMiddleware = require("./middleware/not-found");
const errorHandlerMiddleware = require("./middleware/error-handler");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(cors());
app.use(helmet());
app.use(xss());
app.use(mongoSanitize());

// app.use(morgan("tiny"));
app.use(express.json());

app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.static("./public"));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("e-commerce api");
});

app.get("/api/v1", (req, res) => {
  console.log(req.signedCookies);
  res.send("e-commerce api cookie");
});
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/orders", orderRouter);

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server listening on port ${port}.... `);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
console.log("E-Commerce API");
