const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { createUserToken, attachCookiesToResponse, checkPermissions } = require("../utils");

const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select("-password");
   if (!user) {
    throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
  }
  checkPermissions(req.user,user.id)
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
  res.send("show current user");
};
//update user with user.save()
const updateUser = async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findOne({ _id: req.user.id });
  if(!email || !name){
    throw new CustomError.BadRequestError('Please provide email and name')
  };
  user.name = name;
  user.email = email;
  await user.save();  
  const tokenUser = createUserToken({ user });
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new CustomError.BadRequestError("Please provide both the passwords");
  }
  const user = await User.findOne({ _id: req.user.id });

  const isPasswordMatch = await user.comparePassword(oldPassword);
  if (!isPasswordMatch) {
    throw new CustomError.UnauthenticatedError("Invalid credentials");
  }
  user.password = newPassword;
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Success! password updated" });
};

//update user with findOneAndUpdate-
// const updateUser = async (req, res) => {
//   const { name, email } = req.body;
//   if (!name || !email) {
//     throw new CustomError.BadRequestError("Please provide name and email");
//   }
//   const user = await User.findOneAndUpdate(
//     { _id: req.user.id },
//     { email, name },
//     { new: true, runValidators: true }
//   );
//   const tokenUser = createUserToken({user});
//   attachCookiesToResponse({ res, user: tokenUser });
//   res.status(StatusCodes.OK).json({ user: tokenUser });
// };

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
