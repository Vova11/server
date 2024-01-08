const { db } = require('../../db/models');
const { Picture, Product } = db.sequelize.models;

const cloudinary = require('cloudinary').v2;
const {
	uploadSingleImageFunc,
	uploadMultipleImagesFunc,
} = require('../../config/cloudinary');

const uploadMultipleImages = async (req, res) => {
	try {
		const { images } = req.body;
		const folder = 'your-folder-name/shoe2';
		const uploadedImages = await uploadMultipleImagesFunc(images, folder);

		const imageUrls = {};
		uploadedImages.forEach((image) => {
			imageUrls[image.public_id] = image.secure_url;
		});

		res.status(200).json(imageUrls);
	} catch (error) {
		res.status(500).json({ error: 'Failed to upload images' });
	}
};

const uploadImage = async (req, res) => {
	try {
		const { image } = req.body;
		const folder = 'your-folder-name/shoe2';

		const { secure_url: imageUrl, public_id: publicId } =
			await uploadSingleImageFunc(image, folder);

		const imageUrls = { [publicId]: imageUrl };

		res.status(200).json(imageUrls);
	} catch (error) {
		res.status(500).json({ error: 'Failed to upload image' });
	}
};

const removeImageOnUpdate = async (req, res) => {
	const { publicId } = req.body;

	try {
		const image = await Picture.findOne({ where: { publicId } });

		if (!image) {
			return res.status(404).json({ error: 'Image not found' });
		}

		const product = await Product.findByPk(image.productId);

		if (!product) {
			return res.status(404).json({ error: 'Product not found' });
		}

		await image.destroy(); // Remove the image from the database

		const result = await cloudinary.uploader.destroy(publicId); // Remove the image from Cloudinary

		res.status(200).json({ msg: 'Image was deleted' });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: 'Failed to delete the image' });
	}
};

const removeImage = async (req, res) => {
	const { publicId } = req.body;
	try {
		const result = await cloudinary.uploader.destroy(publicId);
		console.log(result);
		res.status(200).json({ msg: 'image was deleted' });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: 'Failed to delete the image' });
	}
};

// const uploadImageBackUp = async (req, res) => {
// 	const dataUrl = req.body.image;
// 	const [dataType, base64Data] = dataUrl.split(',');
// 	const mimeType = dataType.split(':')[1].split(';')[0];
// 	const imageFormat = mimeType.split('/')[1];
// 	const decodedData = Buffer.from(base64Data, 'base64');
// 	console.log(mimeType);
// 	console.log(imageFormat);
// 	console.log(decodedData);
// 	const fileSizeInBytes = decodedData.length;
// 	const fileSizeInKilobytes = fileSizeInBytes / 1024;
// 	const fileSizeInMegabytes = fileSizeInKilobytes / 1024;

// 	console.log('File Size in Bytes:', fileSizeInBytes);
// 	console.log('File Size in Kilobytes:', fileSizeInKilobytes);
// 	console.log('File Size in Megabytes:', fileSizeInMegabytes);
// 	// const result = await uploadSingleImage(req.body.image);
// 	// console.log('image url is: ' + result);
// 	// res.status(200).json({ msg: 'image uploaded' });
// };
module.exports = {
	uploadImage,
	uploadMultipleImages,
	removeImage,
	removeImageOnUpdate,
};
