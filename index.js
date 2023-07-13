require('dotenv').config({ path: `./.env.${process.env.NODE_ENV}` });
const express = require('express');
require('express-async-errors');
const cors = require('cors');
const PORT = 3002;
const notFoundMiddleware = require('./src/middleware/notFound');
const errorHandlerMiddleware = require('./src/middleware/errorHandler');
const app = express();
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const morgan = require('morgan');
app.set('trust proxy', 1);
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(limiter);
app.use(helmet());
const corsOptions = {
	origin: 'http://localhost:3000',
	credentials: true, //access-control-allow-credentials:true
	// optionSuccessStatus: 200,
};

// const corsOptions = {
// 	origin: 'http://localhost:3000',
// 	credentials: true,
// 	allowedHeaders: [
// 		'set-cookie',
// 		'Content-Type',
// 		'Access-Control-Allow-Origin',
// 		'Access-Control-Allow-Credentials',
// 	],
// };
app.use(cors(corsOptions));
app.use(xss());
if (process.env.NODE_ENV !== 'production') {
	app.use(morgan('tiny'));
}

const cookieParser = require('cookie-parser');
const { parseProductId } = require('./src/helpers/parseProductId.js');
const { sequelize } = require('./src/db/models');

// app.use(
// 	cors({
// 		origin: 'http://localhost:3001',
// 		credentials: true,
// 	})
// );
// Increase payload size limit

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser(process.env.JWT_SECRET));

// Routes
app.get('/', (req, res) => {
	res.json({ Message: 'Server is up and running' });
});

app.get('/api/v1', (req, res) => {
	console.log(req.signedCookies);
	res.send('e-commerce api!');
});

const { attachCookiesToResponse } = require('./src/utils');

app.get('/api/v1/set-cookies', (req, res) => {
	console.log('cookies');
	const user = { id: 1, name: 'John' };
	const refreshToken = 'example-refresh-token';
	// Attach cookies to the response
	attachCookiesToResponse({ res, user, refreshToken });
	res.send('Cookies attached');
});

const apiVersion = '/api/v1';
app.use(`${apiVersion}/auth`, require('./src/routes/auth'));
app.use(`${apiVersion}/users`, require('./src/routes/users'));
app.use(`${apiVersion}/products`, require('./src/routes/products'));
app.use(`${apiVersion}/colours`, require('./src/routes/colours'));
app.use(`${apiVersion}/reviews`, require('./src/routes/reviewRoutes'));
app.use(`${apiVersion}/orders`, require('./src/routes/orderRoutes'));
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const startTheApp = async () => {
	try {
		await sequelize.authenticate();
		console.log('Connection to database has been established successfully.');
		// sequelize.queryInterface
		// 	.dropAllTables()
		// 	.then(() => console.log('All tables dropped'))
		// 	.catch((err) => console.log(err));
		// Start the server
		await sequelize.sync();
		app.listen(PORT, () => {
			console.log('Server started on port ', PORT);
		});
	} catch (error) {
		console.error('Unable to connect to the database: ', error);
		// process.exit(1);
	}
};

startTheApp();
