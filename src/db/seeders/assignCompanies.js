const { Op, Sequelize } = require('sequelize');
const { sequelize, db } = require('../models');
const { Product, Colour, ProductVariant, Company, Size, Picture, Review } =
	db.sequelize.models;
const fs = require('fs');

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

const associateProductsAndCompanies = async (products) => {
	console.log('Assigning company');
	// Step 2: Process and Deduplicate Companies
	const companyNames = products.map((product) => product.company);
	console.log(companyNames);
	const uniqueCompanyNames = Array.from(new Set(companyNames));
	// Step 1: Create a map to store company objects
	const companyMap = new Map();

	// Step 2: Find or create companies
	for (const companyName of uniqueCompanyNames) {
		const existingCompany = await Company.findOne({
			where: { name: companyName },
		});

		if (existingCompany) {
			companyMap.set(companyName, existingCompany);
		} else {
			const newCompany = await Company.create({ name: companyName });
			companyMap.set(companyName, newCompany);
		}
	}

	// Step 3: Associate Products with Companies and update companyId
	for (const product of products) {
		const companyName = product.company;
		const company = companyMap.get(companyName);

		// Find the product by some identifier (e.g., product name) and update companyId
		const foundProduct = await Product.findOne({
			where: { name: product.name }, // Adjust the identifier as needed
		});

		if (foundProduct) {
			foundProduct.companyId = company.id;
			await foundProduct.save(); // Save the updated product
		}
	}
};

module.exports = associateProductsAndCompanies;

// // Call the async function
// associateProductsAndCompanies(products, uniqueCompanyNames)
// 	.then(() => {
// 		console.log('Products associated with companies and saved successfully.');
// 	})
// 	.catch((error) => {
// 		console.error('Error:', error);
// 	});
