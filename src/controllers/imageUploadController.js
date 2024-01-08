const { db } = require('../db/models')
const { Picture, Product, Company } = db.sequelize.models

const cloudinary = require('cloudinary').v2
const {
  uploadSingleImageFunc,
  uploadMultipleImagesFunc,
} = require('../config/cloudinary')

const uploadMultipleImages = async (req, res) => {
  const { images } = req.body
  // console.log(images);
  try {
    const folder = 'your-folder-name/shoe2'
    const uploadedImages = await uploadMultipleImagesFunc(images, folder)
    res.status(200).json(uploadedImages)
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload images' })
  }
}

//WORKING CODE
// const uploadImage = async (req, res) => {
  
//   try {
//     const { image } = req.body
//     const folder = 'your-folder-name/shoe2'
//     const imageUrls = await uploadSingleImageFunc(image, folder);
//     console.log('controler');
//     console.log(imageUrls);
//     // const { secure_url: imageUrl, public_id: publicId } =
//     //   await uploadSingleImageFunc(image, folder)
//     // const imageUrls = {
//     //   publicId,
//     //   url: imageUrl,
//     // }
//     // res.status(200).json(imageUrls)
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to upload image' })
//   }
// }

const uploadImage = async (req, res) => {
  console.log('Uplaoding image function');
  try {
    const { image, id, modelName } = req.body;
    console.log('Model ', modelName);
    const folder = `your-folder-name/shoe2/${modelName}`;

    const imageUrls = await uploadSingleImageFunc(image, folder);
    console.log(imageUrls);
    // Assuming you have the models Product and Company with respective findById functions
   
    let model;

    if (modelName === 'Product') {
      model = await Product.findByPk(id);
    } else if (modelName === 'Company') {
      model = await Company.findByPk(id);
    }
    if (!model) {
      return res.status(404).json({ error: 'Model not found' });
    }
    // Assuming the model has fields 'url' and 'publicId' to store image URL and public ID
    model.url = imageUrls.url;
    model.publicId = imageUrls.publicId;
    await model.save();
    res.status(200).json(imageUrls);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

const removeImage = async (req, res) => {
  const { publicId, productId, source } = req.body
  console.log(source)
  try {
    if (source === 'product') {
      const product = await Product.findByPk(productId)
      if (!product) {
        return res.status(404).json({ error: 'Product not found' })
      }
      const parsedImageData = product.image ? JSON.parse(product.image) : null
      if (parsedImageData && parsedImageData.publicId === publicId) {
        await cloudinary.uploader.destroy(parsedImageData.publicId) // Remove the image from Cloudinary
        product.image = null // Remove the image data from the Product.image field
        await product.save() // Save the updated product without the deleted image
        return res.status(200).json({ msg: 'Image was deleted' })
      }
    }
    if (source === 'picture') {
      const picture = await Picture.findOne({ where: { publicId } })
      if (!picture) {
        return res.status(404).json({ error: 'Image not found' })
      }
      await picture.destroy() // Remove the image from the database
      await cloudinary.uploader.destroy(publicId) // Remove the image from Cloudinary
      return res.status(200).json({ msg: 'Image was deleted' })
    }
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete the image' })
  }
}

module.exports = {
  uploadImage,
  uploadMultipleImages,
  removeImage,
}
