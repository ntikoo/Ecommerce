const StatusCodes = require("http-status-codes");
const CustomAPIError = require("../errors/custom-api");

class UnauthorizedError extends CustomAPIError {
  constructor(message) {
    super(message);
    this.statusCodes = StatusCodes.FORBIDDEN;
  }
}

module.exports = UnauthorizedError;
