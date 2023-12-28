const CustomError = require('../errors');

const checkPermissions=(requestUser, resourceUserId)=>{
if(requestUser.role === 'admin')return;
if(requestUser.id === resourceUserId.toString())return;
throw new CustomError.UnauthorizedError("Access denied")
}

module.exports = checkPermissions;