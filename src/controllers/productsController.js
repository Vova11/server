const { Op } = require('sequelize');
const { db } = require('../db/models');
const { Product, Colour, ProductVariant, Company, Size, Picture, Review } =
	db.sequelize.models;
const { createPictures, deletePicture } = require('../helpers/pictureHelper');
const { createVariants } = require('../helpers/variantHelper');
const CustomError = require('../errors');
const { StatusCodes } = require('http-status-codes');

const getAllProducts = async (req, res) => {
	const sortOptions = {
		latest: ['createdAt', 'DESC'],
		oldest: ['createdAt', 'ASC'],
		'a-z': ['name', 'ASC'],
		'z-a': ['name', 'DESC'],
	};

	const { page = 1, skip = 0, limit = 10, published, sort } = req.query;
	const [sortColumn, sortOrder] = sortOptions[sort] || sortOptions['latest'];
	const offset = (page - 1) * limit + parseInt(skip);

	const whereCondition = {};
	if (published !== undefined) {
		if (published === 'all') {
			// If published is empty, include both true and false values
			whereCondition.published = { [Op.in]: [true, false] };
		} else {
			whereCondition.published = published === 'true';
		}
	}

	const products = await Product.findAndCountAll({
		where: whereCondition,
		order: [[sortColumn, sortOrder]],
		skip: skip,
		limit: limit,
		offset: offset,
		distinct: true, // Add the distinct option to retrieve only distinct products
		include: [
			{
				model: ProductVariant,
				as: 'product_variants',
				attributes: ['id', 'stock'],
				include: [
					{
						model: Size,
						as: 'size',
						attributes: ['id', 'name'],
					},
				],
			},
			{
				model: Picture,
				as: 'product_pictures',
				attributes: ['id', 'publicId', 'url'],
			},
			{
				model: Company,
				as: 'company',
				attributes: ['name'],
			},
			{
				model: Colour,
				as: 'colour',
				attributes: ['name', 'hexColourCode'],
			},

		],
	});

	const transformedProducts = products.rows.map((product) => {
		const variants = product.product_variants.map((variant) => ({
			size: variant?.size?.name,
			stock: variant.stock,
		}));

		// Change the attribute name from product_pictures to images
		const { product_pictures, ...rest } = product.toJSON();

		const images = product_pictures.map((picture) => ({
			id: picture.id,
			publicId: picture.publicId,
			url: picture.url,
		}));

		const parsedData =
			product.image && product.image.length > 0
				? product.image.map(JSON.parse)
				: [];
		
		// Access only the name attribute of the company
  		const companyName = product.company?.name;
		const colourName = product.colour?.name;
		const colourHexColourCode = product.colour?.hexColourCode;

		return {
			...rest,
			image: parsedData,
			images: images,
			variants: variants,
			company: companyName,
			colour: colourName,
			hexColourCode: colourHexColourCode
		};
	});
	
	res.status(StatusCodes.OK).json({
		totalProducts: products.count,
		currentPage: page,
		numOfPages: Math.ceil(products.count / limit),
		products: transformedProducts,
	});
};

const getProductById = async (req, res) => {
	const { id: productId } = req.params;

	const product = await Product.findByPk(productId, {
		include: [
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
				as: 'product_variants',
			},
			{
				model: Picture,
				as: 'product_pictures',
				attributes: ['id', 'publicId', 'url'],
			},
			{
				model: Company,
				as: 'company',
				attributes: ['name']
			},
			{
				model: Colour,
				as: 'colour',
				attributes: ['name', 'hexColourCode']
			},
		],
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
		image: product.image,
		numberOfReviews: product.numberOfReviews,
		variants: [],
		images: product.product_pictures,
		company: product.company,
		colour: product.colour.name,
		hexColourCode: product.colour.hexColourCode
	};

	product.product_variants.forEach((variant) => {
		let size =
			product.product_sizes.length > 0
				? product.product_sizes.find((c) => c.id === variant.sizeId)
				: null;

		let stock = variant.stock;
		let variantData = {
			size: size?.name,
			stock: stock,
		};
		data.variants.push(variantData);
	});

	
	res.status(StatusCodes.OK).json(data);
};

const updateProduct = async (req, res) => {
	const { editProductId: id, variants, images, company, colour, hexColourCode } = req.body;
	const product = await Product.findByPk(id, {
		include: [
			{
				model: Colour,
				as: 'colour',
				attributes: ['name', 'hexColourCode']
			},
			{
				model: Company,
				as: 'company',
				attributes: ['name'],
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
	  product.image = req.body.image;
	  
	// 1. Check if the Company exists, if not, create a new one
	  let existingCompany = await Company.findOne({
		where: { name: company },
	  });
	
	  if (!existingCompany) {
		existingCompany = await Company.create({ name: company });
	  }
	
	  // 2. Check if the Colour exists, if not, create a new one
	  let existingColour = await Colour.findOne({
		where: { name: colour, hexColourCode},
	  });
	
	  if (!existingColour) {
		existingColour = await Colour.create({ name: colour, hexColourCode });
	  }
	
	  // Update the Product with the newly created or existing Company and Colour
	  product.companyId = existingCompany.id;
	  product.colourId = existingColour.id;
	  
	 const updatedVariants = await createVariants(variants, product.id);
	 const variantIds = updatedVariants.map((variant) => variant.id);
	
	// Update only the variants that exist
	await ProductVariant.findAll({
		where: {
			id: variantIds,
		},
	});

	// Remove any variants that were not included in the updated variants
	await ProductVariant.destroy({
		where: {
			id: product.id,
			id: { [Op.notIn]: variantIds },
		},
	});
	// Add new images to the product
	const updatedPictures = await createPictures(images, product.id);
	await product.setProduct_pictures(updatedPictures);
	await product.save();

	// Respond with the updated product
	console.log(product);
	res
		.status(StatusCodes.OK)
		.json({ message: 'Product updated successfully', product });
};

const createProduct = async (req, res) => {
	
	const isError = true;

	if (isError) {
		// Force the function to return a rejected Promise
		return Promise.reject(new Error('An error occurred.'));
	}

	// If no error, continue processing and return a resolved Promise
	return Promise.resolve('Success!');
	
	// const { images, variants, company, colour, hexColourCode } = req.body;
	// delete req.body.variants;

	// let product;
	// let createdCompany;
	// let createdColour;

	// try {
	// 	// Check if the company exists
	// 	const existingCompany = await Company.findOne({
	// 		where: { name: company },
	// 	});

	// 	if (existingCompany) {
	// 		// If the company already exists, use it
	// 		createdCompany = existingCompany;
	// 	} else {
	// 		// If the company does not exist, create a new one
	// 		createdCompany = await Company.create({ name: company  });
			
	// 	}

	// 	// Check if the colour exists
		
		
	// 	const existingColour = await Colour.findOne({
	// 		where: { name: colour },
	// 	});

	// 	if (existingColour) {
	// 		// If the company already exists, use it
	// 		createdColour = existingColour;
	// 	} else {
	// 		// If the company does not exist, create a new one
	// 		createdColour = await Colour.create({ name: colour,  hexColourCode });
			
	// 	}

	// 	// Create the product and associate it with the company
	// 	product = await Product.create({
	// 		...req.body,
	// 		companyId: createdCompany.id,
	// 		colourId: createdColour.id,
	// 	});

	// 	// Add new images to the product
	// 	const updatedPictures = await createPictures(images, product.id);
	// 	await product.setProduct_pictures(updatedPictures);

	// 	// Create variants
	// 	const promises = variants.map(async (variant) => {
	// 		if (variant.size) {
	// 			const [size, sizeCreated] = await Size.findOrCreate({
	// 				where: { name: variant.size },
	// 			});

	// 			const variantInstance = await ProductVariant.create({
	// 				stock: parseInt(variant.stock),
	// 			});

	// 			await variantInstance.setProduct(product);
	// 			await variantInstance.setSize(size);
	// 			return variantInstance;
	// 		} else {
	// 			return null; // Skip creating the variant if color or size is empty
	// 		}
	// 	});

	// 	await Promise.all(promises);
	// 	res.status(StatusCodes.CREATED).json(product);
	// } catch (error) {
	// 	console.error('Failed to create product:', error);
	// 	res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
	// 		msg: 'Failed to create product',
	// 	});
	// }
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
	// Delete associate images and product image
	const picturePromises = product.product_pictures.map(async (image) => {
		deletePicture(image.publicId);
	});
	await Promise.all(picturePromises);
	// const parsedImageData = product.image.map(JSON.parse);
	// const mainPicturePromises = parsedImageData.map(async (image) => {
	// 	deletePicture(image.publicId);
	// });

	// await Promise.all(mainPicturePromises);

	await product.destroy();
	res.status(StatusCodes.OK).json({ message: 'Success! Product removed.' });
};

const publishProduct = async (req, res) => {
	const { id } = req.body;

	try {
		const product = await Product.findByPk(id);
		if (!product) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Product not found' });
		}
		product.published = !product.published; // Toggle the value of the published state
		await product.save(); // Save the updated product
		return res.status(StatusCodes.OK).json({
			message: 'Product published state toggled successfully',
			productId: id,
			published: product.published,
		});
	} catch (error) {
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ message: 'Failed to toggle the published state' });
	}
};

const featureProduct = async (req, res) => {
	const { id } = req.body;

	try {
		const product = await Product.findByPk(id);
		if (!product) {
			return res
				.status(StatusCodes.NOT_FOUND)
				.json({ message: 'Product not found' });
		}
		product.featured = !product.featured; // Toggle the value of the published state
		await product.save(); // Save the updated product
		return res.status(StatusCodes.OK).json({
			message: 'Product published state toggled successfully',
			productId: id,
			published: product.featured,
		});
	} catch (error) {
		return res
			.status(StatusCodes.INTERNAL_SERVER_ERROR)
			.json({ message: 'Failed to toggle the published state' });
	}
};

module.exports = {
	getAllProducts,
	getProductById,
	createProduct,
	deleteProduct,
	updateProduct,
	publishProduct,
	featureProduct,
};
