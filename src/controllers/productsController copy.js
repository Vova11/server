const { Op } = require('sequelize');
const { db } = require('../db/models');
const { Product, Colour, ProductVariant, Size, Picture, Review } =
	db.sequelize.models;
const cloudinary = require('cloudinary').v2;
const { createPictures } = require('../helpers/pictureHelper');
const { createVariants } = require('../helpers/variantHelper');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const getAllProducts = async (req, res) => {
	const { page = 1, skip = 0, limit = 10, featured = null } = req.query;
	const offset = (page - 1) * limit + parseInt(skip);

	let whereClause = {};
	if (featured !== null) {
		whereClause.featured = featured === 'true';
	}

	const products = await Product.findAndCountAll({
		where: whereClause,
		order: [['id', 'DESC']],
		skip: skip,
		limit: limit,
		offset: offset,
	});

	res.status(StatusCodes.OK).json({
		count: products.count,
		currentPage: page,
		totalPages: Math.ceil(products.count / limit),
		products: products.rows,
	});
};

const getProductById = async (req, res) => {
	const { id: productId } = req.params;

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
		// distinct: true, // add this to remove duplicates
	});

	const data = {
		id: product.id,
		name: product.name,
		description: product.description,
		price: product.price,
		freeShipping: product.freeShipping,
		published: product.published,
		featured: product.featured,
		averageRating: product.averageRating,
		numberOfReviews: product.numberOfReviews,
		variants: [],
		images: product.product_pictures,
	};

	product.product_variant.forEach((variant) => {
		let colour = product.product_colours.find((c) => c.id === variant.colourId);
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

	res.status(StatusCodes.OK).json(data);
};

const updateProduct = async (req, res) => {
	const { editProductId: productId, variants, images } = req.body;
	console.log(productId);
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
					model: Picture,
					as: 'product_pictures',
					attributes: ['id', 'publicId', 'url'],
				},
			],
		});
		if (!product) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Product not found' });
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
		await product.save();
		// Respond with the updated product

		res
			.status(StatusCodes.OK)
			.json({ message: 'Product updated successfully', product });
	} catch (error) {
		console.log('si v error');
		console.log(error);
	}
};

const createProduct = async (req, res) => {
	console.log('Creating product');
	console.log(req.body);
	const { images, variants } = req.body; // Destructure the images property from req.body

	delete req.body.variants;

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
	res.status(StatusCodes.CREATED).json(product);
};

const deleteProduct = async (req, res) => {
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
		return res
			.status(StatusCodes.NOT_FOUND)
			.json({ message: 'Product not found' });
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
	res.status(StatusCodes.OK).json({ message: 'Success! Product removed.' });
};

module.exports = {
	getAllProducts,
	getProductById,
	createProduct,
	deleteProduct,
	updateProduct,
};
