const CustomError = require('../errors');
const { db } = require('../db/models');
const { User } = db.sequelize.models;
const { StatusCodes } = require('http-status-codes');

const {
	createTokenUser,
	attachCookiesToResponse,
	checkPermissions,
} = require('../utils');

const index = async (req, res) => {
	const users = await User.findAll({
		where: {
			role: 'user',
		},
		attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
	});
	res.status(StatusCodes.OK).send({ users });
};

const show = async (req, res) => {
	const { id } = req.params;
	console.log('tu si');
	const user = await User.findByPk(id, {
		attributes: {
			exclude: [
				'password',
				'role',
				'createdAt',
				'updatedAt',
				'isVerified',
				'verified',
				'verificationToken',
				'passwordToken',
				'passwordTokenExpirationDate',
			],
		},
	});

	if (!user) {
		throw new CustomError.NotFoundError(`No user with id: ${req.params.id}`);
	}
	checkPermissions(req.user, user.id);
	res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
	res.status(StatusCodes.OK).json({ user: req.user });
};

const update = async (req, res) => {
	const { firstName, lastName, email } = req.body;
	if (!firstName || !email) {
		throw new CustomError.BadRequestError('Please provide all values');
	}
	const user = await User.findByPk(req.user.id);
	if (user === null) {
		throw new CustomError.BadRequest('User not found');
	} else {
		await user.update({
			firstName,
			lastName,
		});
		const tokenUser = createTokenUser(user);
		attachCookiesToResponse({ res, user: tokenUser });
		res.status(StatusCodes.OK).json({ user: tokenUser });
	}
};

const updatePassword = async (req, res) => {
	console.log(req.user);
	const { oldPassword, newPassword } = req.body;
	if (!oldPassword || !newPassword) {
		throw new CustomError.BadRequestError('Please provide both values');
	}
	const user = await User.findByPk(req.user.id);

	const isPasswordCorrect = await user.comparePassword(oldPassword);
	if (!isPasswordCorrect) {
		throw new CustomError.UnauthenticatedError('Invalid credentials');
	}
	user.password = newPassword;
	await user.save();

	res
		.status(StatusCodes.OK)
		.json({ success: true, msg: 'Success! Password updated' });
};

const deleteUser = async (req, res) => {
	const { id } = req.params;
	const deleted = await User.destroy({ where: { id } });
	if (!deleted) {
		throw new BadRequest('User not found');
	}
	return res.status(204).send();
};

module.exports = {
	index,
	show,
	showCurrentUser,
	deleteUser,
	update,
	updatePassword,
};
