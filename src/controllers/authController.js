const { db } = require('../db/models');
const { User, Token } = db.sequelize.models;
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const {
	attachCookiesToResponse,
	sendVerificationEmail,
	sendResetPasswordEmail,
	createTokenUser,
	createHash,
} = require('../utils');
const crypto = require('crypto');

const register = async (req, res) => {
	const { firstName, email, password } = req.body;

	const emailExists = await User.findOne({ where: { email } });

	if (emailExists) {
		throw new CustomError.BadRequestError('Email already exists');
		return;
	}
	const userCount = await User.count();
	let userRole = 'user';
	if (userCount === 0) {
		userRole = 'admin';
	}

	const verificationToken = crypto.randomBytes(40).toString('hex');

	const user = await User.create({
		firstName,
		email,
		password,
		role: userRole,
		verificationToken,
	});

	// const origin = `${process.env.URI}`;
	const origin = 'http://localhost:3000';
	await sendVerificationEmail({
		name: user.firstName,
		email: user.email,
		verificationToken: user.verificationToken,
		origin,
	});
	// const tokenUser = createTokenUser(user);
	// attachCookiesToResponse({ res, user: tokenUser });
	res
		.status(StatusCodes.CREATED)
		.json({ msg: 'Success!, Please check your email to verify account.' });
};

const login = async (req, res) => {
	console.log(process.env.JWT_SECRET);

	const { email, password } = req.body;

	if (!email || !password) {
		throw new CustomError.BadRequestError('Please provide email and user');
	}
	const user = await User.findOne({ where: { email } });
	if (!user) {
		throw new CustomError.UnauthenticatedError('Invalid credentials.');
	}
	const isPasswordCorrect = await user.comparePassword(password);

	if (!isPasswordCorrect) {
		throw new CustomError.UnauthenticatedError('Invalid credentials.');
	}

	if (!user.isVerified) {
		throw new CustomError.UnauthenticatedError('Please verify your email.');
	}

	const tokenUser = createTokenUser(user);

	let refreshToken = '';
	// check for existing token
	const existingToken = await Token.findOne({
		where: {
			userId: user.id,
		},
	});

	if (existingToken) {
		const { isValid } = existingToken;
		if (!isValid) {
			throw new CustomError.UnauthenticatedError('Invalid credentials');
		}
		refreshToken = existingToken.refreshToken;
		attachCookiesToResponse({
			res,
			user: tokenUser,
			refreshToken,
		});

		res.status(StatusCodes.OK).json({ user: tokenUser });
		return;
	}

	refreshToken = crypto.randomBytes(40).toString('hex');

	const userAgent = req.headers['user-agent'];
	const ip = req.ip;
	const userToken = { refreshToken, ip, userAgent, userId: user.id };
	await Token.create(userToken);
	// refreshToken = existingToken.refreshToken
	attachCookiesToResponse({
		res,
		user: tokenUser,
		refreshToken,
	});
	res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = async (req, res) => {
	const existingToken = await Token.findOne({
		where: {
			userId: req.user.id,
		},
	});
	await existingToken.destroy();

	res.cookie('accessToken', 'logout', {
		http: true,
		expires: new Date(Date.now()),
	});
	res.cookie('refreshToken', 'logout', {
		http: true,
		expires: new Date(Date.now()),
	});
	res.status(StatusCodes.OK).json({ msg: 'user was logout' });
};

const verifyEmail = async (req, res) => {
	const { verificationToken, email } = req.body;

	const user = await User.findOne({ where: { email } });
	if (!user) {
		throw new CustomError.UnauthenticatedError('Verification failed user.');
	}

	if (user.verificationToken !== verificationToken) {
		throw new CustomError.UnauthenticatedError('Verification failed token.');
	}
	user.isVerified = true;
	user.verified = Date.now();
	user.verificationToken = '';
	await user.save();
	res.status(StatusCodes.OK).json({ msg: 'Email verified' });
};

const forgotPassword = async (req, res) => {
	const { email } = req.body;
	console.log('chcem zmenit email: ', email);
	if (!email) {
		throw new CustomError.BadRequestError('Please provide valid email');
	}

	const user = await User.findOne({ where: { email } });

	if (user) {
		const passwordToken = crypto.randomBytes(70).toString('hex');
		// send email
		// const origin = `${process.env.URI}`;
		const origin = 'http://localhost:3000';
		await sendResetPasswordEmail({
			name: user.name,
			email: user.email,
			token: passwordToken,
			origin,
		});

		const tenMinutes = 1000 * 60 * 10;
		const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

		user.passwordToken = createHash(passwordToken);
		user.passwordTokenExpirationDate = passwordTokenExpirationDate;
		await user.save();
	}

	res
		.status(StatusCodes.OK)
		.json({ msg: 'Please check your email for reset password link.' });
};

const resetPassword = async (req, res) => {
	const { token, email, password } = req.body;
	console.log(password);
	if (!token || !email || !password) {
		throw new CustomError.BadRequestError('Please provide all values');
	}
	const user = await User.findOne({ where: { email } });

	if (user) {
		const currentDate = new Date();

		if (
			user.passwordToken === createHash(token) &&
			user.passwordTokenExpirationDate > currentDate
		) {
			user.password = password;
			user.passwordToken = null;
			user.passwordTokenExpirationDate = null;
			await user.save();
		}
	}

	res.status(StatusCodes.OK).json({ msg: 'Password has been changed.' });
};

module.exports = {
	register,
	login,
	logout,
	verifyEmail,
	forgotPassword,
	resetPassword,
};
