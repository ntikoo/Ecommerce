const { StatusCodes } = require("http-status-codes");
const User = require("../models/User");
const customError = require("../errors");
const { attachCookiesToResponse, createUserToken } = require("../utils");

const login = async (req, res) => {
  const { password, email } = req.body;
  if (!email || !password) {
    throw new customError.BadRequestError(
      "Please provide both email and password"
    );
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new customError.UnauthenticatedError("Invalid credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new customError.UnauthenticatedError("Invalid credentials");
  }
  const tokenUser = createUserToken({ user });
  // const tokenUser = {
  //   name: user.name,
  //   id: user._id,
  //   role: user.role,
  // };
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ tokenUser });
  // res.send("login user");
};

const register = async (req, res) => {
  const { name, password, email } = req.body;
  const emailAlreadyExists = await User.findOne({ email });
  if (emailAlreadyExists) {
    throw new customError.BadRequestError("Email already exists");
  }
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "user";
  const user = await User.create({ name, password, email, role });

  const tokenUser = createUserToken({ user });
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.CREATED).json({ tokenUser });
};

const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expiresIn: new Date(Date.now() + 5 * 1000),
  });
  res.status(StatusCodes.OK).json({ msg: "user logged out" });
};

module.exports = { login, register, logout };
