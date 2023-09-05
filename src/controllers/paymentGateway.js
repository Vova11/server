const axios = require('axios');
const { log } = require('console');
const crypto = require('crypto');

const Mid = 'demoOMED';
const EshopId = '11111111';
const Key = '1234567812345678123456781234567812345678123456781234567812345678';

// GENRATE SIGN
class Request24pay {
	constructor(mid, eshopId, key) {
		this.mid = mid;
		this.eshopId = eshopId;
		this.key = key;
	}

	sign(message) {
		const hash = crypto.createHash('sha1').update(message).digest();
		const iv = Buffer.from(
			this.mid + this.mid.split('').reverse().join(''),
			'utf8'
		);
		const keyBuffer = Buffer.from(this.key, 'hex');

		const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
		let crypted = cipher.update(hash);
		crypted = Buffer.concat([crypted, cipher.final()]);

		const sign = crypted.slice(0, 16).toString('hex').toUpperCase();
		return sign;
	}
}

const paymentgw = async (req, res) => {
	const { data } = req.body;
	const request24pay = new Request24pay(Mid, EshopId, Key);

	const stringAmount1 = data.Amount;
	const floatAmount1 = parseFloat(stringAmount1);
	const message = `${data.Mid}${floatAmount1.toFixed(2)}${data.CurrAlphaCode}${
		data.MsTxnId
	}${data.FirstName}${data.FamilyName}${data.Timestamp}`;
	const signature = request24pay.sign(message);
	data.Sign = signature;
	try {
		console.log(data);
		const response = await axios.post(
			'https://test.24-pay.eu/pay_gate/paygt',
			data,
			{
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
				},
			}
		);
		res.status(200).json(data);
	} catch (error) {
		console.error('Error making POST request:', error);
		res.status(500).json({ error: 'An error occurred' });
	}
};

module.exports = {
	paymentgw,
};
