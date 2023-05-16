const { db } = require('../db/models');
const { Colour } = db.sequelize.models;

const create = async (req, res) => {
	try {
		const { name } = req.body;

		// Check if a colour with the same name already exists
		const existingColour = await Colour.findOne({ where: { name } });
		if (existingColour) {
			return res.status(400).json({ message: 'Colour already exists' });
		}

		// Create the new colour
		const newColour = await Colour.create({ name });

		res.status(201).json({ colour: newColour });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: 'Internal server error' });
	}
};

module.exports = {
	create,
};
