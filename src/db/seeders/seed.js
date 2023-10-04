const { Op, Sequelize } = require('sequelize');
const { sequelize, db } = require('../models');
const { parsePage } = require('./seedProducts');
const fs = require('fs').promises;
const { User } = db.sequelize.models;
const { exec } = require('child_process');
const path = require('path');
const createDefaultProductVariants = require('./assignVariants');
const associateProductsAndCompanies = require('./assignCompanies');

const baseUrl = 'https://evapify.sk/kategoria/';

const dropAllTables = async () => {
	try {
		await sequelize.queryInterface.dropAllTables();
		console.log('All tables dropped');
	} catch (err) {
		console.error(err);
	}
};

// position: absolute;
//     width: 100%;
//     height: 100%!important;

// const runMigrations = async () => {
// 	try {
// 		const configPath = '../../config/database.js';
// 		const command = `npx sequelize-cli -c ${configPath} db:migrate`;

// 		const { stdout, stderr } = await exec(command);

// 		console.log(`Migrations executed successfully:\n${stdout}`);

// 		if (stderr) {
// 			console.error(`Stderr: ${stderr}`);
// 		} else {
// 			console.log('Migrations completed successfully.');
// 		}
// 	} catch (error) {
// 		console.error(`Error: ${error.message}`);
// 	}
// };

const runMigrations = () => {
	return new Promise((resolve, reject) => {
		const migrate = exec('npm run sequelize', (error, stdout, stderr) => {
			if (error) {
				console.error(`Error: ${error}`);
				reject(error);
			} else {
				console.log(`Migrations executed successfully:\n${stdout}`);
				if (stderr) {
					console.error(`Stderr: ${stderr}`);
				}
				resolve();
			}
		});

		migrate.stdout.pipe(process.stdout);
		migrate.stderr.pipe(process.stderr);
	});
};

const synchronizeDatabase = async () => {
	try {
		await sequelize.sync();
		console.log('Database synchronized');
	} catch (err) {
		console.error(err);
	}
};

const runSeed = async () => {
	try {
		await dropAllTables();
		await runMigrations();
		await synchronizeDatabase();
		await User.create({
			firstName: 'oli@oli.sk',
			email: 'oli@oli.sk',
			password: 'oli@oli.sk',
			role: 'admin',
			isVerified: true,
		});
		const products = await parsePage(baseUrl);
		console.log(products.length);
		const jsonContent = JSON.stringify(products, null, 2); // The null and 2 arguments format the JSON for readability
		fs.writeFile('output.json', jsonContent, 'utf8', (err) => {
			if (err) {
				console.error('Error writing JSON file:', err);
			} else {
				console.log('JSON file has been saved.');
			}
		});
		await createDefaultProductVariants(products);
		await associateProductsAndCompanies(products);
		// console.log('products were created');
	} catch (error) {
		console.error('Error:', error);
	}
};

runSeed();
