const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodeMailerConfig');
const sgMail = require('@sendgrid/mail');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// Set AWS SES configuration
// AWS.config.update({
// 	accessKeyId: process.env.AWS_SES_ACCESS_KEY,
// 	secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
// 	region: process.env.AWS_SES_REGION, // Specify the AWS region using the environment variable
// });

// Create an instance of the SES service
// const SES = new AWS.SES();

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

// const sendEmailAWS = async ({ to, subject, html, text, attachments }) => {
// 	const charset = 'UTF-8';

// 	const params = {
// 		Destination: {
// 			ToAddresses: [process.env.SOURCE_EMAIL], // Recipient's email address
// 		},
// 		Message: {
// 			Body: {
// 				Html: {
// 					Data: html, // Email body content
// 				},
// 			},
// 			Subject: {
// 				Data: subject, // Email subject
// 				Charset: charset,
// 			},
// 		},

// 		Source: `Smoke ${process.env.SOURCE_EMAIL}`, // Sender's email address
// 	};

// 	SES.sendEmail(params, (error, data) => {
// 		if (error) {
// 			console.error('Error sending email:', error);
// 			res;
// 		} else {
// 			console.log('Email sent successfully:', data.MessageId);
// 		}
// 	});
// };

async function sendEmailAWS({ to, subject, html, attachments }) {
	// Get the absolute path to the attachment file

	const mailer = nodemailer.createTransport({
		SES: new AWS.SES({
			accessKeyId: process.env.AWS_SES_ACCESS_KEY,
			secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
			region: process.env.AWS_SES_REGION, // Specify the AWS region using the environment variable
		}),
	});
	await mailer.sendMail({
		from: `Authentication <vladimir.zembera@gmail.com>`,
		to: 'vladimir.zembera@gmail.com',
		subject: 'Your Sign-In Link',
		html,
		attachments,
	});
}

// // Call the sendSignInLink function
// sendEmailAWS({
// 	to: 'vladimir.zembera@gmail.com',
// })
// 	.then(() => {
// 		console.log('Email sent successfully');
// 	})
// 	.catch((error) => {
// 		console.error('Error sending email:', error);
// 	});

const sendEmail = async ({ to, subject, html, attachments }) => {
	if (process.env.NODE_ENV === 'development') {
		// return sendMailEtherum({ to, subject, html });
		return sendEmailAWS({ to, subject, html, attachments });
	} else {
		return sendMailSendgrid({ to, subject, html });
	}
};

module.exports = sendEmail;
