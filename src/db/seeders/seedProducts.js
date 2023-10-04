const { Op, Sequelize } = require('sequelize');
const { sequelize, db } = require('../models');
const { Product, Colour, ProductVariant, Company, Size, Picture, Review } =
	db.sequelize.models;
const cloudinary = require('cloudinary').v2;
const { uploadMultipleImagesFunc } = require('../../config/cloudinary');
const {
	createPictures,
	deletePicture,
} = require('../../helpers/pictureHelper');
const axios = require('axios');
const fs = require('fs').promises;
const stream = require('stream');
const { promisify } = require('util');
const path = require('path'); // Add this line to import the 'path' module

const rp = require('request-promise');
const cheerio = require('cheerio');

const baseUrl = 'https://evapify.sk/kategoria/';
let currentPage = 1;

function extractProductDetails(productElement) {
	const productName = productElement
		.find('.product-name span[itemprop="name"]')
		.text();
	const productLink = productElement
		.find('.product-cell .img-container')
		.attr('href');
	const productImage =
		productElement.find('.img-container img').attr('data-src') ||
		productElement.find('.img-container img').attr('src');
	const company = productElement.find('.brand-name span').text();
	const productPrice = productElement.find('.price-new').text();
	const priceWithoutSymbols = productPrice.replace(/[€,]/g, ''); // Removes € and commas
	const formattedPrice = (parseFloat(priceWithoutSymbols) / 100).toFixed(2);
	return {
		name: productName,
		company: company,
		link: productLink,
		imageMedium: productImage,
		price: formattedPrice,
		images: [],
	};
}
function calculateRandomAverage(min, max) {
	if (min >= max) {
		throw new Error('Invalid range: min must be less than max');
	}
	const numbers = [];
	// Generate random numbers within the range
	for (let i = 0; i < 10; i++) {
		const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
		numbers.push(randomNumber);
	}
	// Calculate the average of the generated numbers
	const sum = numbers.reduce(
		(accumulator, currentValue) => accumulator + currentValue,
		0
	);
	const average = sum / numbers.length;

	return average;
}

// Function to generate a unique filename
function generateUniqueFilename(originalFilename, productName) {
	const fileExtension = path.extname(originalFilename);
	const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
	const randomString = Math.random().toString(36).substring(2, 15);
	return `${timestamp}_${productName}_${randomString}${fileExtension}`;
}

// Function to download and save an image
const downloadAndSaveImage = async (imageUrl, outputDir, productName) => {
	try {
		const response = await fetch(imageUrl);
		const blob = await response.blob();
		const arrayBuffer = await blob.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const uniqueFilename = generateUniqueFilename(
			path.basename(imageUrl),
			productName
		);
		const outputPath = path.join(outputDir, uniqueFilename);
		await fs.writeFile(outputPath, buffer);
		console.log(`Image saved as: ${uniqueFilename}`);
	} catch (error) {
		console.error('Failed to download and save image:', error);
	}
};

// const uploadMultipleImagesFunc = async (images, folder) => {
// 	const uploadedImages = [];

// 	for (const image of images) {
// 		try {
// 			const uploadedImage = await uploadImage(image, folder);
// 			uploadedImages.push(uploadedImage);
// 		} catch (error) {
// 			console.error(`Failed to upload image: ${error.message}`);
// 			// Handle the error as needed (e.g., logging, responding with an error status, etc.)
// 		}
// 	}

// 	return uploadedImages;
// };

const parsePage = async (url) => {
	try {
		const html = await rp(url);
		const $ = cheerio.load(html);

		const products = [];
		let createdCompany;
		const productCells = $('.product-cell');
		for (let i = 0; i < productCells.length; i++) {
			const productElement = productCells.eq(i);
			const product = extractProductDetails(productElement);

			try {
				const detailHtml = await rp(product.link);
				const detail$ = cheerio.load(detailHtml);

				const productParams = {};

				detail$('.product-params tr').each(function () {
					const paramName = detail$(this).find('b[itemprop="name"]').text();
					const paramValue = detail$(this).find('[itemprop="value"]').text();

					// Customize the key (paramName) as needed
					let updatedParamName;

					switch (paramName) {
						case 'Počet potiahnutí':
							updatedParamName = 'puffs'; // Customize the name for this field
							break;
						case 'Množstvo nikotínovej soli':
							updatedParamName = 'nicotineSaltQuantity'; // Customize the name for this field
							break;
						case 'Objem náplne':
							updatedParamName = 'eLiquidVolume'; // Customize the name for this field
							break;
						case 'Batéria':
							updatedParamName = 'battery'; // Customize the name for this field
							break;
						case 'Nikotín':
							updatedParamName = 'nicotine'; // Customize the name for this field
							break;
						case 'Multipacky 10 ks':
							updatedParamName = 'multipack'; // Customize the name for this field
							break;
						default:
							updatedParamName = paramName; // Keep the original name if no customization needed
					}

					// Update the productParams object with the customized key
					productParams[updatedParamName] = paramValue;
				});

				product.details = productParams;

				const imageSmall = detail$('.carousel-inner .item a.product-img').attr(
					'href'
				);
				const imageBig = detail$(
					'#product-img-primary a.product-main-img'
				).attr('href');

				product.imageSmall = imageSmall;
				product.imageBig = imageBig;
				product.images.push(
					// product.imageSmall,
					product.imageMedium
					// product.imageBig
				);

				const outputDir = path.join(__dirname, 'temp');
				for (const image of product.images) {
					await downloadAndSaveImage(image, outputDir, product.name);
				}

				const uploadedImages = await uploadMultipleImagesFunc(
					product.images,
					'eshop/sweetvape'
				);

				// Convert 'áno' to true and 'nie' to false
				const isMultipack = product.details.multipack === 'áno';
				const includesNicotine = product.details.nicotine === 'áno';
				//Assuming Product.create returns a Promise
				const createdProduct = await Product.create({
					name: product.name,
					description: product.name,
					price: product.price,
					published: true,
					company: product.company,
					companyId: null,
					userId: 1,
					averageRating: calculateRandomAverage(3, 5),
					numOfReviews: calculateRandomAverage(3, 30),
					images: [],
					// images: uploadedImages.map((uploadedImage) => uploadedImage.url),
					puffs: product.details.puffs,
					nicotineSaltQuantity: product.details.nicotineSaltQuantity,
					eLiquidVolume: product.details.eLiquidVolume,
					battery: product.details.battery,
					nicotine: includesNicotine,
					multipack: isMultipack,
				});

				const updatedPictures = await createPictures(
					uploadedImages,
					createdProduct.id
				);
				await createdProduct.setProduct_pictures(updatedPictures);

				products.push(product);
			} catch (error) {
				console.error(error);
				// Reject if there's an error in the inner request
				throw error;
			}
		}

		const nextButton = $('.pagination-more .btn-more');
		if (nextButton.length > 0) {
			const nextPageUrl = baseUrl + '?productOffset=' + currentPage * 24; // Assuming 24 products per page
			currentPage++;

			// Recursively call parsePage for the next page
			const nextPageProducts = await parsePage(nextPageUrl);

			// Concatenate the products from the next page with the current page
			return products.concat(nextPageProducts);
		} else {
			// No more pages, resolve with the products from the current page
			return products;
		}
	} catch (error) {
		console.error(error);
		// Reject if there's an error in the main request
		throw error;
	}
};

module.exports = { parsePage };
