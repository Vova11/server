'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			User.hasMany(models.Product, {
				foreignKey: 'userId',
				as: 'products',
				onDelete: 'CASCADE',
			});
			User.hasMany(models.Review, {
				foreignKey: 'userId',
				as: 'reviews',
				onDelete: 'SET NULL',
			});
		}
	}
	User.init(
		{
			firstName: DataTypes.STRING,
			lastName: DataTypes.STRING,
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
				validate: {
					isEmail: {
						args: true,
						msg: 'Invalid email format',
					},
				},
			},
			password: DataTypes.STRING,
			role: {
				type: DataTypes.ENUM('admin', 'user'),
				allowNull: false,
				defaultValue: 'user',
			},
			isVerified: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			verified: {
				type: DataTypes.DATE,
			},
			verificationToken: DataTypes.STRING,
			passwordToken: DataTypes.STRING,
			passwordTokenExpirationDate: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: 'User',
		}
	);

	User.beforeSave(async (user, options) => {
		if (user.changed('password')) {
			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(user.password, salt);
		}
	});

	User.prototype.comparePassword = async function (password) {
		return await bcrypt.compare(password, this.password);
	};

	User.beforeUpdate(async (user, options) => {
		// Check if the email is being updated
		if (user.changed('email')) {
			const existingUser = await User.findOne({ where: { email: user.email } });
			if (existingUser && existingUser.id !== user.id) {
				throw new Error('Email already exists');
			}
		}
	});

	// User.afterUpdate((user, options) => {
	// 	// Perform actions after update here
	// 	console.log('User updated:', user.id);
	// });

	return User;
};
