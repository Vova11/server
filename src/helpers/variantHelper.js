const { Op } = require('sequelize');
const { db } = require('../db/models');
const { Colour, ProductVariant, Size } = db.sequelize.models;

const createVariants = async (variants, productId) => {
	const promises = variants.map(async (variant) => {
		const { color, size, stock } = variant;
		if (color !== '' && size !== '') {
			try {
				let [createdColour] = await Colour.findOrCreate({
					where: { name: color },
				});
				let [createdSize] = await Size.findOrCreate({
					where: { name: size },
				});
				const [createdVariant] = await ProductVariant.findOrCreate({
					where: {
						productId,
						colourId: createdColour.id,
						sizeId: createdSize.id,
					},
					defaults: { stock },
				});
				createdVariant.stock = stock;
				await createdVariant.save();
				return createdVariant;
			} catch (error) {
				console.error('Failed to create variant:', error);
				throw error;
			}
		}
	});
	const createdVariants = await Promise.all(promises);
	const filteredVariants = createdVariants.filter(
		(variant) => variant !== undefined
	);
	return filteredVariants;
};

module.exports = { createVariants };
