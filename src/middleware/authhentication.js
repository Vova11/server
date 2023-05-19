const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');
const { isTokenValid } = require('../utils');

const authenticateUser = (req, res, next) => {
	const token = req.signedCookies.token;
	if (!token) {
		throw new CustomError.UnauthenticatedError('Invalid authentication');
	}
	try {
		const { id, name, role } = isTokenValid({ token });
		req.user = { id, name, role };
		next();
	} catch (error) {
		throw new CustomError.UnauthenticatedError('Invalid authentication');
	}
};

const authorizePermissions = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			throw new CustomError.UnauthorizedError(
				'Unauthorized to access this route'
			);
		}
		next();
	};
};

module.exports = {
	authenticateUser,
	authorizePermissions,
};

// const sequelize = require('../models');
// const { Token } = sequelize.models;

// const {
//   isTokenValid,
//   attachCookiesToResponse,
// } = require('../utils');

// const authenticateUser = async (req, res, next) => {
//   const { refreshToken, accessToken } = req.signedCookies;

//   try {
//     if (accessToken) {
//       const payload = isTokenValid(accessToken);
//       req.user = payload.user;
//       return next();
//     }
//     const payload = isTokenValid(refreshToken);

//     const existingToken = await Token.findOne({
//       where: {
//         userId: payload.user.id,
//         refreshToken: payload.refreshToken,
//       },
//     });

//     if (!existingToken || !existingToken?.isValid) {
//       throw new CustomError.UnauthenticatedError('Authentication Invalid');
//     }

//     attachCookiesToResponse({
//       res,
//       user: payload.user,
//       refreshToken: existingToken.refreshToken,
//     });

//     req.user = payload.user;
//     next();
//   } catch (error) {
//     throw new CustomError.UnauthenticatedError('Authentication Invalid');
//   }
// };

// // const authenticateUser = (req, res, next) => {
// //   const token = req.signedCookies.token;

// //   if (!token) {
// //     throw new CustomError.UnauthenticatedError('Authentication Invalid');
// //   }
// //   try {
// //     const user = isTokenValid({ token });
// //     req.user = { name: user.name, id: user.id, role: user.role };
// //     next();
// //   } catch (error) {
// //     throw new CustomError.UnauthenticatedError('Authentication Invalid');
// //   }
// // };

// const authorizePermissions = (...roles) => {
//   return (req, res, next) => {
//     if (!roles.includes(req.user.role)) {
//       throw new CustomError.UnauthorizedError(
//         'Unauthorized to access this route'
//       );
//     }
//     next();
//   };
// };

// const allowToOrder = async (req, res, next) => {
//   const token = req.signedCookies.token;
//   if (token) {
//     const { name, id, role } = isTokenValid({ token });
//     req.user = { name, id, role };
//   } else {
//     req.user = 'null';
//   }
//   next();
// };

// module.exports = {
//   authenticateUser,
//   authorizePermissions,
// };
