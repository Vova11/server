const sendEmail = require('./sendEmail')
const path = require('path')
const fs = require('fs')
const ejs = require('ejs')

// HTML EMAIL
const sendOrderConfirmationEmail = async ({
  name,
  email,
  attachments,
  id,
  link,
  user,
}) => {
  // Define the data to fill placeholders in the template
  // Load the EJS template

  const relativeFilePath = './orderConfirmationTemplate.ejs'
  // Get the absolute path to the file
  const absoluteFilePath = path.resolve(__dirname, relativeFilePath)
  const template = fs.readFileSync(absoluteFilePath, 'utf-8')
  const templateData = {
    id,
    name,
    link,
    user,
    // Add more parameters as needed
  }
  // Render the EJS template
  const emailBody = ejs.render(template, templateData)

  return sendEmail({
    to: email,
    subject: 'Order confirmation',
    html: emailBody,
    attachments,
  })
}

module.exports = sendOrderConfirmationEmail
