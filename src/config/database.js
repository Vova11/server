require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });

module.exports = {
	development: {
		username: 'postgres',
		password: 'password',
		database: 'eshop_db',
		host: 'localhost',
		dialect: 'postgres',
	},
	test: {
		username: 'postgres',
		password: 'password',
		database: 'eshop_db_TEST',
		host: 'localhost',
		dialect: 'postgres',
	},
	production: {
		username: process.env.DB_USER,
		password: process.env.DB_PASSWORD,
		database: process.env.DB_NAME,
		host: process.env.DB_HOST,
		dialect: 'postgres',
		dialectOptions: {
			ssl: {
				require: true, // This will help you. But you will see nwe error
				rejectUnauthorized: false, // This line will fix new error
			},
		},
	},
};
