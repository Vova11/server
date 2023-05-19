const CustomError = require('../errors')

const checkPermissions = (requestUser, resourceUserId) => {
  if (requestUser.role === 'admin') return;
  if (requestUser.id === resourceUserId) return;
  throw new CustomError.UnauthorizedError('Not authorized to access this route')
}

module.exports = checkPermissions;