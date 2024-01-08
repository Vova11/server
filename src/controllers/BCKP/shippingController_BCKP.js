const { db } = require('../../db/models')
const { Order, Delivery } = db.sequelize.models
const CustomError = require('../../errors')
const { StatusCodes } = require('http-status-codes')
const { checkPermissions } = require('../../utils')
const axios = require('axios')
const xml2js = require('xml2js')

const apiUrl = 'http://www.zasilkovna.cz/api/rest'
const apiPassword = '17b379a82c3b836b442cdf1c38b2fdd7'

const jsonToXml = (data) => {
  const builder = new xml2js.Builder()
  return builder.buildObject(data)
}

const xmlToJson = (xmlData, callback) => {
  const parser = new xml2js.Parser()
  parser.parseString(xmlData, callback)
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
  console.log(order);
  const requestData = {
    createPacket: {
      apiPassword: apiPassword,
      packetAttributes: {
        number: order.id,
        name: order.firstName,
        surname: order.lastName,
        email: order.email,
        phone: order.phone,
        addressId: order.streetId,
        street: order.street,
        city: order.city,
        houseNumber: order.houseNumber,
        zip: order.zipCode,
        value: order.total,
        eshop: 'sweetvape.eu',
        weight: '0.3',
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
          console.error('1');
          console.error(err);
          res.send(StatusCodes.BAD_REQUEST)
        } else if (!result.response || !result.response.result) {
          // Check if the response data is structured as expected
          console.error(result.response);
          res.status(StatusCodes.BAD_REQUEST).send(result.response)
        } else {
          console.error('Success creating Packeta label');
          console.log(result.response.result[0]);
          order.delivery.status = result.response.status[0]
          order.delivery.resultId = result.response.result[0].id[0]
          order.delivery.barcode = result.response.result[0].barcode[0]
          order.delivery.barcodeText = result.response.result[0].barcodeText[0]
          // Save the changes to the database
          await order.delivery.save()
          res.send(StatusCodes.OK)
        }
      })
    })
    .catch((error) => {
      console.error('4');
      console.error(error);
      res.send(StatusCodes.BAD_REQUEST)
    })
}

module.exports = {
  createPacketa,
}
