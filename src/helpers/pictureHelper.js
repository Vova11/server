const { db } = require('../db/models');
const { Picture } = db.sequelize.models;

const createPictures = async (images, productId) => {
	const promises = images.map(async (imageArray) => {
		if (Array.isArray(imageArray)) {
			const [publicId, imageUrl] = imageArray;
			try {
				const picture = await Picture.create({
					publicId,
					url: imageUrl,
					productId,
				});
				console.log(`Picture with publicId ${publicId} saved to the database.`);
				return picture;
			} catch (error) {
				console.error(
					`Failed to save picture with publicId ${publicId}:`,
					error
				);
				throw error;
			}
		} else {
			const { publicId, url } = imageArray;
			try {
				const picture = await Picture.create({
					publicId,
					url,
					productId,
				});
				console.log(`Picture with publicId ${publicId} saved to the database.`);
				return picture;
			} catch (error) {
				console.error(
					`Failed to save picture with publicId ${publicId}:`,
					error
				);
				throw error;
			}
		}
	});

	const createdPictures = await Promise.all(promises);
	return createdPictures;
};

module.exports = { createPictures };
