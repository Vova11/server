const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodeMailerConfig');
const AWS = require('aws-sdk');
const sgMail = require('@sendgrid/mail');

const sendMailEtherum = async ({ to, subject, html }) => {
	let testAccount = await nodemailer.createTestAccount();
	const transporter = nodemailer.createTransport(nodemailerConfig);

	return transporter.sendMail({
		from: '"Batukai e-shop" <batukai@example.com>', // sender address
		to,
		subject,
		html,
	});
};

const sendMailSendgrid = async ({ to, subject, html }) => {
	sgMail.setApiKey(process.env.SENDGRID_API_KEY);
	const msg = {
		from: 'vladimir.zembera@gmail.com',
		to,
		subject,
		html,
	};

	return sgMail.send(msg);
};

const sendMailSES = async ({ to, subject, html }) => {
	// Check if the environment is development
	if (process.env.NODE_ENV === 'development') {
		to = 'vladimir.zembera@gmail.com'; // Modify the "to" email address for development
	}

	const ses = new AWS.SES({
		accessKeyId: process.env.AWS_SES_ACCESS_KEY,
		secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
		region: process.env.AWS_SES_REGION,
	});

	const params = {
		Destination: {
			ToAddresses: [to],
		},
		Message: {
			Body: {
				Html: {
					Charset: 'UTF-8',
					Data: html,
				},
			},
			Subject: {
				Charset: 'UTF-8',
				Data: subject,
			},
		},
		Source: 'vladimir.zembera@gmail.com',
	};

	try {
		const response = await ses.sendEmail(params).promise();

		// Check if the email was successfully delivered
		try {
			const response = await ses.sendEmail(params).promise();

			// Check if the email was successfully delivered
			if (response.MessageId) {
				console.log('Email sent successfully:', response.MessageId);
				// You can perform additional actions here, like updating a database or sending a confirmation to the user
			} else {
				console.log('Email delivery failed');
				console.log(response); // Log the response for troubleshooting
				throw new Error('Email delivery failed');
				// Handle the scenario where email delivery failed
			}

			return response;
		} catch (error) {
			console.error('Error sending email:', error);
			if (error.response) {
				console.log('Error response:', error.response); // Log the response for troubleshooting
			}
			throw error; // Re-throw the error to be caught by the calling code
		}
	} catch (error) {
		console.error('Error sending email:', error);
		throw error; // Re-throw the error to be caught by the calling code
	}
};

module.exports = { sendMailSES, sendMailSendgrid, sendMailEtherum };
