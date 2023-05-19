const { db } = require('../db/models');
const { User } = db.sequelize.models;
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');

const { attachCookiesToResponse, createTokenUser } = require('../utils');

const register = async (req, res) => {
	const { firstName, email, password } = req.body;
	const emailExists = await User.findOne({ where: { email } });
	if (emailExists) {
		throw new CustomError.BadRequestError('Email already exists');
	}
	const userCount = await User.count();
	let userRole = 'user';
	if (userCount === 0) {
		userRole = 'admin';
	}
	const user = await User.create({
		firstName,
		email,
		password,
		role: userRole,
	});
	const tokenUser = createTokenUser(user);
	attachCookiesToResponse({ res, user: tokenUser });
	res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password) {
		throw new CustomError.BadRequestError('Please provide email and  user');
	}
	const user = await User.findOne({ where: { email } });
	if (!user) {
		throw new CustomError.UnauthenticatedError('Invalid credentials.');
	}
	const isPasswordCorrect = await user.comparePassword(password);
	if (!isPasswordCorrect) {
		throw new CustomError.UnauthenticatedError('Invalid credentials.');
	}
	const tokenUser = createTokenUser(user);
	attachCookiesToResponse({ res, user: tokenUser });
	res.status(StatusCodes.OK).json({ user: tokenUser });
};

const logout = (req, res) => {
	res.cookie('token', 'logout', {
		http: true,
		expires: new Date(Date.now() + 5 * 1000),
	});
	res.status(StatusCodes.OK).json({ msg: 'user was logout' });
};

module.exports = {
	register,
	login,
	logout,
};
