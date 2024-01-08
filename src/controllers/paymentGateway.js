const axios = require('axios')
const { log } = require('console')
const crypto = require('crypto')

const Mid = process.env.MiD
const EshopId = process.env.EshopId
const Key = process.env.Key

// GENRATE SIGN
class Request24pay {
  constructor(mid, eshopId, key) {
    this.mid = mid
    this.eshopId = eshopId
    this.key = key
  }

  sign(message) {
    const hash = crypto.createHash('sha1').update(message).digest()
    const iv = Buffer.from(
      this.mid + this.mid.split('').reverse().join(''),
      'utf8'
    )
    const keyBuffer = Buffer.from(this.key, 'hex')

    const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv)
    let crypted = cipher.update(hash)
    crypted = Buffer.concat([crypted, cipher.final()])
// Using subarray() method to create a new buffer with the sliced data
    const slicedBuffer = crypted.subarray(0, 16)
    // Converting the sliced buffer to a hexadecimal string
    const sign = slicedBuffer.toString('hex').toUpperCase()
    return sign
  }
}

// const paymentgw = async (req, res) => {
//   const { data } = req.body;

//   // List of required fields
//   const requiredFields = ['Amount', 'CurrAlphaCode', 'MsTxnId', 'FirstName', 'FamilyName', 'Timestamp'];
//   const allFieldsPresent = requiredFields.every(field => field in data);

//   if (!allFieldsPresent) {
//     return res.status(400).json({ msg: 'Missing required fields' });
//   }

//   try {
//     const request24pay = new Request24pay(Mid, EshopId, Key);

//     // Prepare data for signature generation
//     const floatAmount = parseFloat(data.Amount);
//     const inputData = {
//       floatAmount: floatAmount.toFixed(2),
//       currAlphaCode: data.CurrAlphaCode,
//       msTxnId: data.MsTxnId,
//       firstName: data.FirstName,
//       familyName: data.FamilyName,
//       timestamp: data.Timestamp
//     };

    
//     // Generate the signature using the request24pay.sign method
//     const signature = request24pay.sign(inputData);
//     console.log(signature);

//     // Modify data object with additional properties
//     data.Amount = data.Amount.toFixed(2);
//     data.Country = data.Country;
//     data.Mid = Mid;
//     data.EshopId = EshopId;
//     data.Sign = signature;
//     data.lastName = data.FamilyName;

//     // Check the signature criteria
//     if (signature.length === 32 && /^[a-zA-Z0-9]+$/.test(signature)) {
//       // If the signature meets the criteria, send response 200
//       res.status(200).json({ msg: 'ok', data });
//     } else {
//       // If the signature doesn't meet the criteria, send response 500
//       res.status(500).send({ msg: 'Invalid signature' });
//     }
//   } catch (error) {
//     // Handle errors
//     res.status(500).send('Internal server error');
//   }
// };

const paymentgw = async (req, res) => {
  const { data } = req.body;

  // List of required fields
  // Ensure all required fields are present
  const requiredFields = ['Amount', 'CurrAlphaCode', 'MsTxnId', 'FirstName', 'FamilyName', 'Timestamp'];
  const allFieldsPresent = requiredFields.every(field => field in data);

  if (!allFieldsPresent) {
    return res.status(400).json({ msg: 'Missing required fields' });
  }

  try {
    const request24pay = new Request24pay(Mid, EshopId, Key);

  
    
    const stringAmount1 = data.Amount;
    const floatAmount1 = parseFloat(stringAmount1);
    const message = `${Mid}${floatAmount1.toFixed(2)}${data.CurrAlphaCode}${data.MsTxnId}${data.FirstName}${data.FamilyName}${data.Timestamp}`;
    const signature = request24pay.sign(message);
    console.log(signature);

    data.Amount = data.Amount.toFixed(2);
    data.Country = data.Country;
    data.Mid = Mid;
    data.EshopId = EshopId;
    data.Sign = signature;
    data.lastName = data.FamilyName;

    if (signature.length === 32 && /^[a-zA-Z0-9]+$/.test(signature)) {
      // If the signature is exactly 32 characters long and alphanumeric, send response 200
      res.status(200).json({ msg: 'ok', data });
    } else {
      // If the signature doesn't meet the criteria, send response 500
      res.status(500).send({ msg: 'Invalid signature' });
    }
  } catch (error) {
    // Handle errors
    res.status(500).send('Internal server error');
  }
};

module.exports = {
  paymentgw,
}
