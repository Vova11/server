const cloudinary = require('cloudinary').v2

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const opts = {
  overwrite: true,
  invalidate: true,
  resource_type: 'auto',
}

const uploadSingleImageFunc = async (imageFile, folder) => {
  console.log('uploadFunc')

  try {
    const result = await cloudinary.uploader.upload(imageFile, {
      folder: folder,
      transformation: [
        { width: 553, height: 500, crop: 'fit' }, // Resize to fit within 553x500 pixels without cropping
      ],
    })
    // Return an object containing secure_url and public_id
    return {
      publicId: result.public_id,
      url: result.secure_url,
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    throw new Error('Failed to upload image')
  }
}

// WORKING CODE
// const uploadSingleImageFunc = async (imageFile, folder) => {
// 	try {
// 		const result = await cloudinary.uploader.upload(imageFile, {
// 			folder: folder,
// 			transformation: [
// 				{ width: 553, height: 500, crop: 'fill' }, // Resize to 553x500 pixels
// 			],
// 		});
// 		// Return an object containing secure_url and public_id
// 		return {
// 			secure_url: result.secure_url,
// 			public_id: result.public_id,
// 		};
// 	} catch (error) {
// 		// Handle upload error
// 		console.error('Error uploading image:', error);
// 		throw error;
// 	}
// };

const uploadMultipleImagesFunc = async (imageFiles, folder) => {
  let item
  try {
    const uploadPromises = imageFiles.map((imageFile) =>
      cloudinary.uploader.upload(imageFile, {
        folder: folder,
        transformation: [
          { width: 553, height: 500, crop: 'fill' }, // Resize to 553x500 pixels
        ],
      })
    )
    const results = await Promise.all(uploadPromises)

    // Return the array of uploaded image URLs
    let items = results.map((result) => ({
      publicId: result.public_id,
      url: result.secure_url,
      // secureUrl: result.secure_url,
    }))

    return items
  } catch (error) {
    // Handle upload error
    console.error('Error uploading images:', error)
    throw error
  }
}

module.exports = {
  uploadSingleImageFunc,
  uploadMultipleImagesFunc,
}
