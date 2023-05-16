const { Op } = require('sequelize');
const { db } = require('../../db/models');
const { Product, Colour, ProductVariant, Size } = db.sequelize.models;
const { parseProductId } = require('../../helpers/parseProductId');

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
			],
			distinct: true, // add this to remove duplicates
		});

		const data = {
			id: product.id,
			name: product.name,
			description: product.description,
			price: product.price,
			variants: [],
		};

		let colour;
		let size;
		let stock;
		let variantData;
		console.log('Product dlzka');
		console.log(typeof product.product_sizes);
		console.log(product.product_sizes.length);
		product.product_variant.forEach((variant) => {
			colour = product.product_colours.find((c) => c.id === variant.colourId);
			size =
				product.product_sizes.length > 0
					? product.product_sizes.find((c) => c.id === variant.sizeId)
					: null;
			console.log(variant.sizeId);
			console.log(product.product_sizes);
			stock = variant.stock;
			variantData = {
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

const createProduct = async (req, res) => {
	const variants = req.body.variants;
	delete req.body.variants;

	try {
		const product = await Product.create(req.body);

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
		const product = await Product.findByPk(id);
		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}
		await product.destroy();
		res.status(204).end();
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

const updateProduct = async (req, res) => {
	const productId = req.body.id;
	const variants = req.body.variants;

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
			],
		});

		if (!product) {
			return res.status(404).json({ message: 'Product not found' });
		}

		// Update the product's basic information
		product.name = req.body.name;
		product.description = req.body.description;
		product.price = req.body.price;

		// Update the product's variants
		const updatedVariants = await Promise.all(
			variants.map(async (variant) => {
				console.log(variant);
				let colour = await Colour.findOne({ where: { name: variant.colour } });
				if (!colour) {
					colour = await Colour.create({ name: variant.colour });
				}

				let size = await Size.findOne({ where: { name: variant.size } });

				if (!size) {
					size = await Size.create({ name: variant.size });
				}

				let productVariant = await ProductVariant.findOne({
					where: {
						productId: product.id,
						colourId: colour.id,
						sizeId: size.id,
					},
				});
				if (!productVariant) {
					productVariant = await ProductVariant.create({
						productId: product.id,
						colourId: colour.id,
						sizeId: size.id,
					});
				}

				productVariant.stock = variant.stock;
				await productVariant.save();

				return productVariant;
			})
		);

		// Remove any variants that were not included in the updated variants
		const variantIds = updatedVariants.map((variant) => variant.id);
		await ProductVariant.destroy({
			where: {
				productId: product.id,
				id: { [Op.notIn]: variantIds },
			},
		});

		// Respond with the updated product
		res.status(200).json({ message: 'Product updated successfully', product });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Error updating product' });
	}
};

const removeColorFromProduct = async (req, res) => {
	const { id: productId } = req.body.product;
	const { id: colorId } = req.body.color;

	console.log(productId);
	console.log(colorId);
	try {
		const product = await Product.findByPk(productId);
		if (!product) {
			return res.status(404).send('Product not found');
		}
		const color = await Colour.findByPk(colorId);
		console.log(color);
		// Remove the association between the product and the color. Color wont be removed
		await product.removeColour(color);
		res.status(200).json({ msg: 'Color deleted from product', product });
	} catch (error) {
		console.log(error);
	}
};

module.exports = {
	getAllProducts,
	getProductById,
	createProduct,
	deleteProduct,
	updateProduct,
	removeColorFromProduct,
};

// const sizes = ['S', 'M', 'L', 'XL'];
// await Promise.all(
// 	coloursInstances.map(async (color) => {
// 		await Promise.all(
// 			sizes.map(async (size) => {
// 				const variant = await ProductVariant.create({
// 					productId: product.id,
// 					colourId: color.id,
// 					size,
// 				});

// 				// You can also add Stock to the variant here
// 				// const stock = await Stock.create({ quantity: 0 });
// 				// await stock.setProductVariant(variant);
// 			})
// 		);
// 	})
// );

// Check if a colour with the same name already exists
// const existingColour = await Colour.findOne({ where: { name } });
// if (existingColour) {
//   return res.status(400).json({ message: 'Colour already exists' });
// }

// Create the new colour
// const newColour = await Colour.create({ name });
// if (colors && colors.length > 0) {
//       const colorIds = await Promise.all(
//         colors.map(async (color) => {
//           const existingColor = await Color.findOne({ where: { name: color } });
//           if (existingColor) {
//             return existingColor.id;
//           } else {
//             const newColor = await Color.create({ name: color });
//             return newColor.id;
//           }
//         })
//       );
