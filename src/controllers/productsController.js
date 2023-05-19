const { Op } = require('sequelize');
const { db } = require('../db/models');
const { Product, Colour, ProductVariant, Size, Picture } = db.sequelize.models;
const { parseProductId } = require('../helpers/parseProductId');
const cloudinary = require('cloudinary').v2;
const { createPictures } = require('../helpers/pictureHelper');
const { createVariants } = require('../helpers/variantHelper');

const getAllProducts = async (req, res) => {
	try {
		const products = await Product.findAll();
		res.json({ products });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
};

const getProductById = async (req, res) => {
	const productId = parseProductId(req.params.id);

	try {
		const product = await Product.findByPk(productId, {
			include: [
				{
					model: Colour,
					as: 'product_colours',
					attributes: ['id', 'name'],
					through: {
						model: ProductVariant,
						attributes: ['stock'],
					},
				},
				{
					model: Size,
					as: 'product_sizes',
					attributes: ['id', 'name'],
					through: {
						model: ProductVariant,
						attributes: ['stock'],
					},
				},
				{
					model: ProductVariant,
					as: 'product_variant',
				},
				{
					model: Picture,
					as: 'product_pictures',
					attributes: ['id', 'publicId', 'url'],
				},
			],
			distinct: true, // add this to remove duplicates
		});

		const data = {
			id: product.id,
			name: product.name,
			description: product.description,
			price: product.price,
			variants: [],
			images: product.product_pictures,
		};

		// let colour;
		// let size;
		// let stock;
		// let variantData;

		product.product_variant.forEach((variant) => {
			let colour = product.product_colours.find(
				(c) => c.id === variant.colourId
			);
			let size =
				product.product_sizes.length > 0
					? product.product_sizes.find((c) => c.id === variant.sizeId)
					: null;

			let stock = variant.stock;
			let variantData = {
				colour: colour?.name,
				size: size?.name,
				stock: stock,
			};
			data.variants.push(variantData);
		});

		res.status(200).json(data);
	} catch (error) {
		console.log(error);
	}
};

const updateProduct = async (req, res) => {
	const productId = req.body.id;
	const variants = req.body.variants;
	const images = req.body.images;

	try {
		// Find the product by its ID
		const product = await Product.findByPk(productId, {
			include: [
				{
					model: Colour,
					as: 'product_colours',
					attributes: ['id', 'name'],
					through: {
						model: ProductVariant,
						attributes: ['stock'],
					},
				},
				{
					model: Size,
					as: 'product_sizes',
					attributes: ['id', 'name'],
					through: {
						model: ProductVariant,
						attributes: ['stock'],
					},
				},
				{
					model: Picture,
					as: 'product_pictures',
					attributes: ['id', 'publicId', 'url'],
				},
			],
		});

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		// Update the product's basic information
		product.name = req.body.name;
		product.description = req.body.description;
		product.price = req.body.price;

		const updatedVariants = await createVariants(variants, product.id);
		const variantIds = updatedVariants.map((variant) => variant.id);
		// Remove any variants that were not included in the updated variants
		await ProductVariant.destroy({
			where: {
				productId: product.id,
				id: { [Op.notIn]: variantIds },
			},
		});

		// Add new images to the product
		const updatedPictures = await createPictures(images, product.id);
		await product.setProduct_pictures(updatedPictures);

		// Respond with the updated product
		res.status(200).json({ message: 'Product updated successfully', product });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Error updating product' });
	}
};

const createProduct = async (req, res) => {
	const { images, variants } = req.body; // Destructure the images property from req.body

	delete req.body.variants;

	try {
		const product = await Product.create(req.body);
		//creating pictures
		// Add new images to the product
		const updatedPictures = await createPictures(images, product.id);
		await product.setProduct_pictures(updatedPictures);

		// //creating variants
		const promises = variants.map(async (variant) => {
			const [color, colorCreated] = await Colour.findOrCreate({
				where: { name: variant.color },
			});

			const [size, sizeCreated] = await Size.findOrCreate({
				where: { name: variant.sizes },
			});

			const variantInstance = await ProductVariant.create({
				stock: parseInt(variant.stock),
			});

			await variantInstance.setProduct(product);
			await variantInstance.setColour(color);
			await variantInstance.setSize(size);
			return variantInstance;
		});

		await Promise.all(promises);
		res.status(200).json(product);
	} catch (error) {
		console.log(error);
	}
};

const deleteProduct = async (req, res) => {
	try {
		const { id } = req.params;
		const product = await Product.findByPk(id, {
			include: [
				{
					model: Picture,
					as: 'product_pictures',
					attributes: ['id', 'publicId'],
				},
			],
		});
		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		const picturePromises = product.product_pictures.map(async (image) => {
			try {
				const result = await cloudinary.uploader.destroy(image.publicId);
				console.log(`Picture with publicId ${image.publicId} was deleted.`);
				return;
			} catch (error) {
				console.error(
					`Failed to delete picture with publicId ${image.publicId}:`,
					error
				);
				throw error;
			}
		});

		await Promise.all(picturePromises);

		await product.destroy();
		res.status(204).end();
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

module.exports = {
	getAllProducts,
	getProductById,
	createProduct,
	deleteProduct,
	updateProduct,
};
