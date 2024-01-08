const sendEmail = require('./sendEmail')

const sendContactEmail = async ({ name, email, phone, message }) => {
  console.log('Contact email function to send out the email');
  console.log(name, email, phone, message );
  return sendEmail({
    to: email,
    subject: 'Contact form email',
    html: `<h4>hello Admin</h4>, 
      <p>Contact person: ${name}</p>
      <p>Contact email:${email}</p>
      <p>Contact phone:${phone}</p>
      <p>Body message: </p>
      <p>${message}</p>
    `,
  });
};

module.exports = sendContactEmail;

