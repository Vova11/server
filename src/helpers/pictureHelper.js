const { db } = require('../db/models');
const { Picture } = db.sequelize.models;
const cloudinary = require('cloudinary').v2;

const createPictures = async (images, productId) => {
	let pictures = [];

	const promises = images.map(async (image) => {
		const { publicId, url } = image;

		try {
			// Check if the picture already exists in the database
			const existingPicture = await Picture.findOne({ where: { publicId } });
			if (existingPicture) {
				console.log(
					`Picture with publicId ${publicId} already exists in the database.`
				);
				pictures.push(existingPicture);
			} else {
				const picture = await Picture.create({
					publicId,
					url,
					productId,
				});
				console.log(`Picture with publicId ${publicId} saved to the database.`);
				pictures.push(picture);
			}
		} catch (error) {
			console.error(`Failed to save picture with publicId ${publicId}:`, error);
			throw error;
		}
	});

	await Promise.all(promises);

	return pictures;
};

const deletePicture = async (publicId) => {
	try {
		const result = await cloudinary.uploader.destroy(publicId);
		console.log(`Picture with publicId ${publicId} was deleted.`);
		return;
	} catch (error) {
		console.error(`Failed to delete picture with publicId ${publicId}:`, error);
		throw error;
	}
};

module.exports = { createPictures, deletePicture };
