const {
	sendContactEmail
} = require('../utils');

const contactEmail = async (req, res) => {
  console.log('Contact email controller');
  const {name, email, phone, message } = req.body;
  try {
    await sendContactEmail({name, email, phone, message})  
    res.status(200).json({msg: 'Email sent successfully'})
  } catch (error) {
    res.status(200).json({msg: 'Email was not sent.'})
  }
  
  
  // try {
  //   res.status(200).json(req.body); // Sending a response in this example  
  // } catch (error) {
  //   console.log(error);
  //   res.status(400).json(error);
  // }
  
};

module.exports = { contactEmail }; 