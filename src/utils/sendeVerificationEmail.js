const sendEmail = require('./sendEmail');

const sendVerificationEmail = async ({
	name,
	email,
	verificationToken,
	origin,
}) => {
	const verifyEmail = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;
	const message = `
    <p>
      Please confirm your email by clicking on following link : <a href="${verifyEmail}">Verify email</a>
    </p>`;

	return sendEmail({
		to: email,
		subject: 'Email confirmation',
		html: `<h4>hello, 
      ${name}</h4${message}<h4>
      Tu je body emailu ${verifyEmail}</h4>
      <p>Mozno dalsi text z databzi sem</p>
    `,
	});
};

module.exports = sendVerificationEmail;
