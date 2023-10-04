const { Op, Sequelize } = require('sequelize');
const { sequelize, db } = require('../models');
const { Product, ProductVariant, Size } = db.sequelize.models;
// const fs = require('fs');

// const readDataFromFile = (filePath) => {
// 	try {
// 		const jsonData = fs.readFileSync(filePath, 'utf8');
// 		const products = JSON.parse(jsonData);
// 		return products;
// 	} catch (error) {
// 		console.error(`Error reading data from file: ${error.message}`);
// 		return [];
// 	}
// };

// // Usage in your method
// const filePath = './output.json'; // Update with your file path
// const products = readDataFromFile(filePath);

const createDefaultProductVariants = async (products) => {
	const defaultSizeName = '1';
	const defaultStock = 5;

	// Create a Size instance for the default size (if it doesn't exist)
	const [defaultSize] = await Size.findOrCreate({
		where: { name: defaultSizeName },
	});

	// Create default ProductVariant instances for each product
	const defaultVariants = await Promise.all(
		products.map(async (product) => {
			// Find the product by some identifier (e.g., product name) and update productId
			const foundProduct = await Product.findOne({
				where: { name: product.name }, // Adjust the identifier as needed
			});

			if (foundProduct) {
				const defaultVariant = await ProductVariant.create({
					productId: foundProduct.id, // Update with the found product's ID
					sizeId: defaultSize.id,
					stock: defaultStock,
				});

				return defaultVariant;
			}
		})
	);

	return defaultVariants;
};

module.exports = createDefaultProductVariants;

// createDefaultProductVariants(products)
// 	.then(() => {
// 		console.log('Products associated with product Variants.');
// 	})
// 	.catch((error) => {
// 		console.error('Error:', error);
// 	});
