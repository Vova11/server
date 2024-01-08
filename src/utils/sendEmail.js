const nodemailer = require('nodemailer');
const nodemailerConfig = require('./nodeMailerConfig');
const AWS = require('aws-sdk');

// Set AWS SES configuration
AWS.config.update({
  accessKeyId: process.env.AWS_SES_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
  region: process.env.AWS_SES_REGION // Specify the AWS region using the environment variable
});

const sendEmailEtherum = async ({ to, subject, html, attachments }) => {
  const transporter = nodemailer.createTransport(nodemailerConfig);
  return transporter.sendMail({
    from: '"Batukai e-shop" <batukai@example.com>', // Sender address
    to,
    subject,
    html,
    attachments
  });
};

const sendEmailAWS = async ({ to, subject, html, attachments }) => {
  const mailer = nodemailer.createTransport({
    SES: new AWS.SES({
      accessKeyId: process.env.AWS_SES_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SES_SECRET_ACCESS_KEY,
      region: process.env.AWS_SES_REGION // Specify the AWS region using the environment variable
    })
  });
  await mailer.sendMail({
    from: `Batukai e-shop <vladimir.zembera@gmail.com>`,
    to: 'vladimir.zembera@gmail.com',
    subject,
    html,
    attachments
  });
};

const sendEmail = async ({ to, subject, html, attachments }) => {
  if (process.env.NODE_ENV === 'development') {
    return sendEmailEtherum({ to, subject, html, attachments });
  } else {
    return sendEmailAWS({ to, subject, html, attachments });
  }
};

module.exports = sendEmail;
