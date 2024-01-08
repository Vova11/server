const path = require('path')
const pdf = require('html-pdf')
const util = require('util')
const fs = require('fs')
const ejs = require('ejs')
const { formatDate } = require('../helpers/helperFunctions')

const pdfTemplate = require('../../documents')
// Convert the pdf.create function to use Promises
const createPdfPromise = util.promisify(pdf.create)
const { sendOrderConfirmationEmail } = require('../utils')

const createInvoice = async (req, res) => {
  const { id, msTxnId } = req.body
  console.log(req.body)
  const invoiceFileName = id + msTxnId
  const pdfPath = path.join(
    __dirname,
    '..',
    '..',
    'invoices',
    `invoice_${invoiceFileName}.pdf`
  )

  // Check if the PDF file already exists
  if (fs.existsSync(pdfPath)) {
    return res.status(200).json({ msg: 'Invoice already exists' })
  }

  try {
    // Define the data to be passed to the template
    const logoUrl = '/public/pdfLogo.png'
    const templateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      id: req.body.id,
      msTxnId: req.body.msTxnId,
      orderItems: req.body.orderItems,
      phone: req.body.phone,
      city: req.body.city,
      street: req.body.street,
      country: req.body.country,
      subtotal: req.body.subtotal,
      total: req.body.total,
      shippingFee: req.body.shippingFee,
      createdAt: formatDate(req.body.createdAt),
    }

    // Render the EJS template with the data
    ejs.renderFile(
      path.join(__dirname, '..', '..', '/documents/invoice.ejs'),
      templateData,
      (err, html) => {
        if (err) {
          console.error(err)
          return res.status(500).send({ msg: 'Error rendering EJS template' })
        }

        // Create the PDF
        const pdfOptions = {}
        pdf.create(html, pdfOptions).toFile(pdfPath, (pdfErr) => {
          if (pdfErr) {
            console.error(pdfErr)
            return res.status(500).send({ msg: 'Error creating PDF' })
          }

          // Set the response headers for downloading
          res.setHeader('Content-Type', 'application/pdf')
          res.setHeader(
            'Content-Disposition',
            `attachment; filename="${invoiceFileName}.pdf"`
          )

          // Send the PDF file to the client
          return res.sendFile(pdfPath)
        })
      }
    )
  } catch (err) {
    console.error(err)
    return res.status(500).json({msg: 'Error creating PDF'})
  }
}


const downloadInvoice = async (req, res) => {
  
  try {
    // Construct the file path based on the invoiceFileName
    const invoiceFileName = req.params.invoiceFileName
    const filePath = path.join(
      __dirname,
      '..',
      '..',
      '/invoices',
      `invoice_${invoiceFileName}.pdf`
    )
    if (!fs.existsSync(filePath)) {
      throw new Error('File not found');
    }
    res.sendFile(filePath)
    // Send an order confirmation email (optional)
  } catch (error) {
    console.error(error)
    res.status(500).json(error)
  }
}

module.exports = {
  createInvoice,
  downloadInvoice
}
