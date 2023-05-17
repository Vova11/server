require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });

const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 3008;

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
app.get('/batukai', (req, res) => {
	res.send('hi in batukai eshop. Fuck off Pico!!');
});
const apiVersion = '/api/v1';
app.use(`${apiVersion}/products`, require('./src/routes/products'));
app.use(`${apiVersion}/colours`, require('./src/routes/colours'));

console.log('kok');
console.log(process.env.NODE_ENV);
console.log('Port je: ', PORT);
console.log('port z dockeru');
console.log(process.env.PORT);
console.log(process.env.HOST);
console.log(process.env.PORT);

const startTheApp = async () => {
	try {
		await sequelize.authenticate();
		console.log('Connection to database has been established successfully.');
		// sequelize.queryInterface
		// 	.dropAllTables()
		// 	.then(() => console.log('All tables dropped'))
		// 	.catch((err) => console.log(err));
		await sequelize.sync();
		// Start the server
		app.listen(PORT, () => {
			console.log('Server started on port ', PORT);
		});
	} catch (error) {
		console.error('Unable to connect to the database: ', error);
		// process.exit(1);
	}
};

startTheApp();
