const { Op } = require('sequelize');
const { db } = require('../db/models');
const { ProductVariant, Size } = db.sequelize.models;

const createVariants = async (variants, productId) => {
	const promises = variants.map(async (variant) => {
		const { size, stock } = variant;
		if (size !== '') {
			try {
				let [createdSize] = await Size.findOrCreate({
					where: { name: size },
				});
				const [createdVariant] = await ProductVariant.findOrCreate({
					where: {
						productId,
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
