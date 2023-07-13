const { isTokenValid, createJWT, attachCookiesToResponse } = require('./jwt');
const createTokenUser = require('./createTokenUser');
const checkPermissions = require('./checkPermissions');
const sendEmail = require('./sendEmail');
const sendVerificationEmail = require('./sendeVerificationEmail');
const sendResetPasswordEmail = require('./sendResetPasswordEmail');
const createHash = require('./createHash');
module.exports = {
	isTokenValid,
	createJWT,
	attachCookiesToResponse,
	createTokenUser,
	checkPermissions,
	sendEmail,
	sendVerificationEmail,
	sendResetPasswordEmail,
	createHash,
};
