const {
	sendMailSES,
	sendMailSendgrid,
	sendMailEtherum,
} = require('./mailDeliverServices');

const sendEmail = async ({ to, subject, html }) => {
	if (process.env.NODE_ENV === 'development') {
		console.log('development mail sending...');
		// return sendMailEtherum({ to, subject, html });
	} else {
		console.log('production mail sending...');
		return sendMailSES({ to, subject, html });
	}
};

module.exports = sendEmail;
