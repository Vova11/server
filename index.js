require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });

const express = require('express');
const cors = require('cors');
const PORT = 3002 || process.env.PORT;

const bodyParser = require('body-parser');

const app = express();
const { parseProductId } = require('./src/helpers/parseProductId.js');
const { sequelize } = require('./src/db/models');

// app.use(express.json());
app.use(cors());
// Increase payload size limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
const apiVersion = '/api/v1';
app.use(`${apiVersion}/products`, require('./src/routes/products'));
app.use(`${apiVersion}/colours`, require('./src/routes/colours'));

const startTheApp = async () => {
	try {
		await sequelize.authenticate();
		console.log('Connection to database has been established successfully.');
		await sequelize.sync();
		// sequelize.queryInterface
		// 	.dropAllTables()
		// 	.then(() => console.log('All tables dropped'))
		// 	.catch((err) => console.log(err));
		// Start the server
		app.listen(PORT, () => {
			console.log('Server started on port ', 3002);
		});
	} catch (error) {
		console.error('Unable to connect to the database: ', error);
		console.error('Unable to sync the database: ', error);
		// process.exit(1);
	}
};

startTheApp();
