const cloudinary = require('cloudinary').v2;

// Configuration
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const opts = {
	overwrite: true,
	invalidate: true,
	resource_type: 'auto',
};

const uploadMultipleImagesFunc = async (imageFiles, folder) => {
	try {
		const uploadPromises = imageFiles.map((imageFile) =>
			cloudinary.uploader.upload(imageFile, { folder: folder })
		);
		const results = await Promise.all(uploadPromises);

		// Return an array of objects containing secure_url and public_id
		return results.map((result) => ({
			secure_url: result.secure_url,
			public_id: result.public_id,
		}));
	} catch (error) {
		// Handle upload error
		console.error('Error uploading images:', error);
		throw error;
	}
};

const uploadSingleImageFunc = async (imageFile, folder) => {
	try {
		const result = await cloudinary.uploader.upload(imageFile, {
			folder: folder,
		});
		// Return an object containing secure_url and public_id
		return {
			secure_url: result.secure_url,
			public_id: result.public_id,
		};
	} catch (error) {
		// Handle upload error
		console.error('Error uploading image:', error);
		throw error;
	}
};

// const uploadMultipleImagesFunc = async (imageFiles, folder) => {
// 	try {
// 		const uploadPromises = imageFiles.map((imageFile) =>
// 			cloudinary.uploader.upload(imageFile, { folder: folder })
// 		);
// 		const results = await Promise.all(uploadPromises);

// 		// Return the array of uploaded image URLs
// 		return results.map((result) => result.secure_url);
// 	} catch (error) {
// 		// Handle upload error
// 		console.error('Error uploading images:', error);
// 		throw error;
// 	}
// };

// const uploadSingleImageFunc = async (imageFile, folder) => {
// 	try {
// 		const result = await cloudinary.uploader.upload(imageFile, {
// 			folder: folder,
// 		});
// 		// Return the uploaded image URL
// 		return result.secure_url
// 	} catch (error) {
// 		// Handle upload error
// 		console.error('Error uploading image:', error);
// 		throw error;
// 	}
// };

module.exports = {
	uploadSingleImageFunc,
	uploadMultipleImagesFunc,
};
