const { Op, Sequelize } = require('sequelize');
const { db } = require('../db/models');
const { Product, Colour, ProductVariant, Company, Size, Picture, Review } =
	db.sequelize.models;

const constructIncludeArray = (company) => {
	const includeArray = [
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
			model: Colour,
			as: 'colour',
			attributes: ['name', 'hexColourCode'],
		},
	];

	if (company !== 'all') {
		includeArray.push({
			model: Company,
			as: 'company',
			attributes: ['name'],
			where: {
				name: company,
			},
		});
	}

	return includeArray;
};

const transformProduct = (product) => {
	const variants = product.product_variants.map((variant) => ({
		size: variant?.size?.name,
		stock: variant.stock,
	}));

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
		hexColourCode: colourHexColourCode,
	};
};

module.exports = { constructIncludeArray, transformProduct };
