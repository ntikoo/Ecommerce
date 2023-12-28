const { signedCookie } = require("cookie-parser");
const CustomError = require("../errors");
const { isTokenValid } = require("../utils");

const authenticateUser = async (req, res, next) => {
  const token = req.signedCookies.token;
  if (!token) {
    throw new CustomError.UnauthenticatedError("Authentication invalid");
  }
  try {
    const { name, id, role } = isTokenValid({ token });
    req.user = { name, id, role };
  } catch (error) {
    throw new CustomError.UnauthenticatedError("Invalid access");
  }
  next();
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError("access denied");
    }
     next();
  }; 
};

module.exports = { authenticateUser, authorizePermissions };
