const { db } = require('../db/models')
const { Order, Delivery } = db.sequelize.models
const CustomError = require('../errors')
const { StatusCodes } = require('http-status-codes')
const axios = require('axios')
const xml2js = require('xml2js')
const { STATUS_CODES } = require('http')
const { formatDate } = require('../helpers/helperFunctions')
const cheerio = require('cheerio')
const apiUrl = process.env.packetaApiUrl
const apiPassword = process.env.packetaApiPassword
7

const jsonToXml = (data) => {
  const builder = new xml2js.Builder()
  return builder.buildObject(data)
}

const xmlToJson = (xmlData, callback) => {
  const parser = new xml2js.Parser()
  parser.parseString(xmlData, callback)
}

function getCountryCode(country) {
  switch (country) {
    case 'HU':
      return '763'
    case 'SK':
      return '131'
    case 'CZ':
      return '106'
    case 'PL':
      return '14052'
    default:
      return '131' // Default value for 'SK'
  }
}

const createPacketa = async (req, res) => {
  const { orderId } = req.body
  const order = await Order.findByPk(orderId, {
    include: [
      {
        model: Delivery,
        as: 'delivery',
      },
    ],
  })

  const countryCode = getCountryCode(order.country) // This will return 11

  const requestData = {
    createPacket: {
      apiPassword: apiPassword,
      packetAttributes: {
        number: order.id,
        name: order.firstName,
        surname: order.lastName,
        email: order.email,
        phone: order.phone,
        addressId:
          order.delivery.deliveryType === 'HD'
            ? countryCode
            : order.delivery.streetId,
        value: order.total,
        eshop: 'sweetvape.eu',
        weight: '0.3',
        street: order.street,
        city: order.city,
        houseNumber: order.houseNumber,
        zip: order.zipCode,
        allowPublicTracking: 1,
        security: {
          allowPublicTracking: '1',
        },
      },
    },
  }

  const xmlRequest = jsonToXml(requestData)

  axios
    .post(apiUrl, xmlRequest, {
      headers: {
        'Content-Type': 'application/xml',
      },
    })
    .then(async (response) => {
      // Handle the response data here
      const xmlResponse = response.data

      xmlToJson(xmlResponse, async (err, result) => {
        if (err) {
          console.error('1')
          console.error(err)
          res.send(StatusCodes.BAD_REQUEST)
        } else if (!result.response || !result.response.result) {
          console.log(result.response)
          res.status(StatusCodes.BAD_REQUEST).send(result.response)
        } else {
          order.delivery.status = result.response.status[0]
          order.delivery.resultId = result.response.result[0].id[0]
          order.delivery.barcode = result.response.result[0].barcode[0]
          order.delivery.barcodeText = result.response.result[0].barcodeText[0]
          // Save the changes to the database
          await order.delivery.save()
          console.log('order was updated')
          console.log(order.delivery)
          res.send(StatusCodes.OK)
        }
      })
    })
    .catch((error) => {
      console.error('4')
      console.error(error)
      res.send(StatusCodes.BAD_REQUEST)
    })
}

const makePdfApiRequest = async (requestData) => {
  const xmlRequest = jsonToXml(requestData)
  const response = await axios.post(apiUrl, xmlRequest, {
    headers: {
      Accept: 'application/pdf',
    },
  })
  return response.data
}

const parseXmlString = (xmlString) => {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser()
    parser.parseString(xmlString, (err, result) => {
      if (err) {
        console.error('Error parsing XML:', err)
        reject(err)
      } else {
        const responseStatus = result.response.status[0]
        const responseError = result.response.fault
          ? result.response.fault[0]
          : null
        const base64PdfData = result.response.result[0]
        resolve([responseStatus, responseError, base64PdfData])
      }
    })
  })
}

const getCarrierId = async (packetId) => {
  const requestData = {
    packetCourierNumberV2: {
      apiPassword,
      packetId,
    },
  }
  try {
    const xmlString = await makePdfApiRequest(requestData)
    const parser = new xml2js.Parser()

    return new Promise((resolve, reject) => {
      parser.parseString(xmlString, (err, result) => {
        if (err) {
          console.error('Error parsing XML:', err)
          reject(err)
        } else {
          const courierNumber = result.response.result[0].courierNumber[0]
          console.log('Courier Number:', courierNumber)
          resolve(courierNumber)
        }
      })
    })
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

const generatePackectPdf = async (req, res, data) => {
  const { packetId, id, type } = data
  const courierNumber = type === 'HD' ? await getCarrierId(packetId) : null

  const requestData =
    type === 'HD'
      ? {
          packetCourierLabelPdf: {
            apiPassword: apiPassword,
            packetId,
            courierNumber,
          },
        }
      : {
          packetLabelPdf: {
            apiPassword: apiPassword,
            packetId,
            format: 'A7 on A4',
            offset: 0,
          },
        }

  const pdfData = await makePdfApiRequest(requestData)
  const [responseStatus, responseError, base64PdfData] = await parseXmlString(
    pdfData
  )

  res.status(200).json({ msg: 'ok', status: responseStatus, base64PdfData })
}

const printPacketaLabel = async (req, res) => {
  const { packetId, id, type } = req.body
  data = {
    packetId,
    id,
    type,
  }

  await generatePackectPdf(req, res, data)
}

const infoAboutPacketa = async (req, res) => {
  const { packetId, id, type } = req.body

  try {
    const requestData = {
      packetStatus: {
        apiPassword,
        packetId,
      },
    }

    const xmlRequest = jsonToXml(requestData)
    const response = await axios.post(apiUrl, xmlRequest)
    const [responseStatus, responseError, base64PdfData] = await parseXmlString(
      response.data
    )

    // Load the statusText into Cheerio
    const $ = cheerio.load(base64PdfData.statusText[0])
    // Extract text content
    const textContent = $.text()

    // Extract links
    const links = []
    $('a').each((index, element) => {
      const href = $(element).attr('href')
      const text = $(element).text()
      links.push({ href, text })
    })

    const formattedData = {
      dateTime: formatDate(base64PdfData.dateTime[0]),
      statusCode: base64PdfData.statusCode[0],
      codeText: base64PdfData.codeText[0],
      statusText: base64PdfData.statusText[0],
      branchId: base64PdfData.branchId[0],
      destinationBranchId: base64PdfData.destinationBranchId[0],
      externalTrackingCode: base64PdfData.externalTrackingCode[0],
      isReturning: base64PdfData.isReturning[0],
      storedUntil: base64PdfData.storedUntil[0],
      carrierId: base64PdfData.carrierId[0],
      carrierName: base64PdfData.carrierName[0],
      textContent,
      links,
    }
    // Send the formatted data as a JSON response to your frontend
    res
      .status(200)
      .json({ msg: 'ok', responseStatus, responseError, data: formattedData })
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  createPacketa,
  printPacketaLabel,
  infoAboutPacketa,
}
