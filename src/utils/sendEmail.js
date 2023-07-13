const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodeMailerConfig');
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

const sendEmail = async ({ to, subject, html }) => {
	if (process.env.NODE_ENV === 'development') {
		return sendMailEtherum({ to, subject, html });
	} else {
		return sendMailSendgrid({ to, subject, html });
	}
};

module.exports = sendEmail;
