const { Op, Sequelize } = require('sequelize')
const { db } = require('../db/models')
const { Product, Colour, ProductVariant, Company, Size, Picture, Review } =
  db.sequelize.models
const { createPictures, deletePicture } = require('../helpers/pictureHelper')
const { createVariants } = require('../helpers/variantHelper')
const CustomError = require('../errors')
const { StatusCodes } = require('http-status-codes')
const {
  constructIncludeArray,
  transformProduct,
} = require('../helpers/constructIncludeArray')

const getAllProducts = async (req, res) => {
  const sortOptions = {
    latest: ['createdAt', 'DESC'],
    oldest: ['createdAt', 'ASC'],
    'a-z': ['name', 'ASC'],
    'z-a': ['name', 'DESC'],
    'price-lowest': ['price', 'ASC'], // New entry for price-lowest
    'price-highest': ['price', 'DESC'], // New entry for price-highest
  }

  const {
    page = 1,
    skip = 0,
    limit = 20,
    published,
    featured,
    sort,
    company,
    search,
    nicotine,
  } = req.query
  
  const [sortColumn, sortOrder] = sortOptions[sort] || sortOptions['latest']
  const offset = (page - 1) * limit + parseInt(skip)

  const whereCondition = {}

  if (featured === 'all') {
    // If published is empty, include both true and false values
    whereCondition.featured = { [Op.in]: [true, false] }
  } else {
    whereCondition.featured = featured === 'true'
  }

  if (published === 'all') {
    // If published is empty, include both true and false values
    whereCondition.published = { [Op.in]: [true, false] }
  } else {
    whereCondition.published = published === 'true'
  }

  if (company !== 'all') {
    whereCondition['$company.name$'] = { [Op.eq]: company }
  }

  if (search) {
    whereCondition.name = {
      [Op.iLike]: `%${search}%`,
    }
  }

  if (nicotine === 'all') {
    // No filter on nicotine, include both true and false values
    whereCondition.nicotine = { [Op.in]: [true, false] }
  } else {
    // Filter products by the specific nicotine value
    whereCondition.nicotine = nicotine === 'true'
  }

  try {
    const includeAssociatedModels = constructIncludeArray(company)
    const products = await Product.findAndCountAll({
      where: whereCondition,
      order: [[sortColumn, sortOrder]],
      skip: skip,
      limit: limit,
      offset: offset,
      distinct: true, // Add the distinct option to retrieve only distinct products
      include: includeAssociatedModels,
      // attributes: ['published', 'company','featured', 'nicotine', 'id', 'name']
    })

    const transformedProducts = products.rows.map(transformProduct)

    // return all unique companies
    const uniqueCompanyNames = await Company.findAll({
      attributes: [
        [Sequelize.fn('DISTINCT', Sequelize.col('name')), 'name'], // Use DISTINCT to get unique names
      ],
    })

    return res.status(StatusCodes.OK).json({
      totalProducts: products.count,
      currentPage: page,
      numOfPages: Math.ceil(products.count / limit),
      products: transformedProducts,
      companies: uniqueCompanyNames,
    })
  } catch (error) {
    console.log(error)
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to load products' })
  }
}

const getProductById = async (req, res) => {
  const { id: productId } = req.params
  console.log(productId)
  try {
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
          attributes: ['name'],
        },
        {
          model: Colour,
          as: 'colour',
          attributes: ['name', 'hexColourCode'],
        },
        {
          model: Review,
          as: 'reviews',
          attributes: ['id', 'title', 'comment'],
        },
      ],
    })

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
      product_variants: [],
      images: product.product_pictures,
      company: product.company,
      colour: product.colour?.name,
      variants: [],
      hexColourCode: product.colour?.hexColourCode,
      reviews: product.reviews,
      puffs: product.puffs,
      nicotineSaltQuantity: product.nicotineSaltQuantity,
      eLiquidVolume: product.eLiquidVolume,
      battery: product.battery,
      nicotine: product.nicotine,
      multipack: product.multipack,
    }

    product.product_variants.forEach((variant) => {
      let size =
        product.product_sizes.length > 0
          ? product.product_sizes.find((c) => c.id === variant.sizeId)
          : null

      let stock = variant.stock
      console.log(size)
      let variantData = {
        size: size?.name,
        stock: stock,
      }
      data.variants.push(variantData)
    })

    res.status(StatusCodes.OK).json(data)
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Could not load product' })
  }
}

// const updateProduct = async (req, res) => {
// 	const {
// 		editProductId: id,
// 		variants,
// 		images,
// 		company,
// 		colour,
// 		hexColourCode,
// 	} = req.body;

// 	try {
// 		const product = await Product.findByPk(id, {
// 			include: [
// 				// Include your required associations here
// 			],
// 		});

// 		if (!product) {
// 			return res
// 				.status(StatusCodes.NOT_FOUND)
// 				.json({ message: 'Product not found' });
// 		}

// 		// Update the product's basic information
// 		product.name = req.body.name;
// 		product.description = req.body.description;
// 		product.price = req.body.price;
// 		product.image = req.body.image;

// 		// 1. Check if the Company exists, if not, create a new one
// 		let existingCompany = await Company.findOne({
// 			where: { name: company },
// 		});

// 		if (!existingCompany) {
// 			existingCompany = await Company.create({ name: company });
// 		}

// 		// 2. Check if the Colour exists, if not, create a new one
// 		let existingColour = await Colour.findOne({
// 			where: { name: colour, hexColourCode },
// 		});

// 		if (!existingColour) {
// 			existingColour = await Colour.create({ name: colour, hexColourCode });
// 		}

// 		// Update the Product with the newly created or existing Company and Colour
// 		product.companyId = existingCompany.id;
// 		product.colourId = existingColour.id;

// 		// Create or update variants and keep track of variant IDs
// 		const variantIds = [];

// 		for (const variantData of variants) {
// 			if (variantData.id) {
// 				// If variant ID is provided, update the existing variant
// 				const existingVariant = await ProductVariant.findByPk(variantData.id);

// 				if (existingVariant) {
// 					existingVariant.stock = variantData.stock;
// 					await existingVariant.save();
// 					variantIds.push(existingVariant.id);
// 				}
// 			} else {
// 				// If variant ID is not provided, create a new variant
// 				const { size, stock } = variantData;
// 				if (size !== '') {
// 					let [createdSize] = await Size.findOrCreate({
// 						where: { name: size },
// 					});
// 					const [createdVariant] = await ProductVariant.findOrCreate({
// 						where: {
// 							productId: product.id,
// 							sizeId: createdSize.id,
// 						},
// 						defaults: { stock },
// 					});
// 					createdVariant.stock = stock;
// 					await createdVariant.save();
// 					variantIds.push(createdVariant.id);
// 				}
// 			}
// 		}

// 		// Remove any variants that were not included in the updated variants
// 		const variantsToRemove = await ProductVariant.findAll({
// 			where: {
// 				productId: product.id,
// 				id: { [Op.notIn]: variantIds },
// 			},
// 		});

// 		for (const variantToRemove of variantsToRemove) {
// 			await variantToRemove.destroy();
// 		}

// 		// Add new images to the product
// 		const updatedPictures = await createPictures(images, product.id);
// 		await product.setProduct_pictures(updatedPictures);
// 		await product.save();

// 		res
// 			.status(StatusCodes.OK)
// 			.json({ message: 'Product updated successfully', product });
// 	} catch (error) {
// 		console.error('Failed to update product:', error);
// 		res
// 			.status(StatusCodes.INTERNAL_SERVER_ERROR)
// 			.json({ message: 'Failed to update product' });
// 	}
// };

const updateProduct = async (req, res) => {
  const {
    editProductId: id,
    variants,
    images,
    company,
    colour,
    hexColourCode,
  } = req.body

  const product = await Product.findByPk(id, {
    include: [
      {
        model: Colour,
        as: 'colour',
        attributes: ['name', 'hexColourCode'],
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
  })

  if (!product) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Product not found' })
  }

  // Update the product's basic information
  product.name = req.body.name
  product.description = req.body.description
  product.price = req.body.price
  product.image = req.body.image

  // 1. Check if the Company exists, if not, create a new one
  let existingCompany = await Company.findOne({
    where: { name: company },
  })

  if (!existingCompany) {
    existingCompany = await Company.create({ name: company })
  }

  // 2. Check if the Colour exists, if not, create a new one
  let existingColour = await Colour.findOne({
    where: { name: colour, hexColourCode },
  })

  if (!existingColour) {
    existingColour = await Colour.create({ name: colour, hexColourCode })
  }

  // Update the Product with the newly created or existing Company and Colour
  product.companyId = existingCompany.id
  product.colourId = existingColour.id

  const updatedVariants = await createVariants(variants, product.id)
  const variantIds = updatedVariants.map((variant) => variant.id)

  // // Sort the updatedVariants array by createdAt in ascending order
  // const sortedUpdatedVariants = updatedVariants.sort((a, b) => {
  // 	return new Date(a.createdAt) - new Date(b.createdAt);
  // });

  // Get the current variants associated with the product
  const existingVariants = await ProductVariant.findAll({
    where: {
      productId: product.id, // Specify the product ID here
    },
  })

  // Get the IDs of the existing variants
  const existingVariantIds = existingVariants.map((variant) => variant.id)

  // Identify the IDs of variants that are no longer included
  const variantsToRemove = existingVariantIds.filter(
    (variantId) => !variantIds.includes(variantId)
  )

  // Remove the variants that should be deleted
  await ProductVariant.destroy({
    where: {
      id: variantsToRemove,
    },
  })

  // Update only the variants that exist
  // await ProductVariant.findAll({
  // 	where: {
  // 		id: variantIds,
  // 	},
  // });

  // // Remove any variants that were not included in the updated variants
  // await ProductVariant.destroy({
  // 	where: {
  // 		id: product.id,
  // 		id: { [Op.notIn]: variantIds },
  // 	},
  // });

  // Add new images to the product
  const updatedPictures = await createPictures(images, product.id)
  await product.setProduct_pictures(updatedPictures)
  await product.save()

  res
    .status(StatusCodes.OK)
    .json({ message: 'Product updated successfully', product })
}

const createProduct = async (req, res) => {
  console.log(req.body)
  const { images, variants, company, colour, hexColourCode } = req.body
  delete req.body.variants

  let product
  let createdCompany
  let createdColour

  try {
    // Check if the company exists
    const existingCompany = await Company.findOne({
      where: { name: company },
    })

    if (existingCompany) {
      // If the company already exists, use it
      createdCompany = existingCompany
    } else {
      // If the company does not exist, create a new one
      createdCompany = await Company.create({ name: company })
    }

    // Check if the colour exists

    const existingColour = await Colour.findOne({
      where: { name: colour },
    })

    if (existingColour) {
      // If the company already exists, use it
      createdColour = existingColour
    } else {
      // If the company does not exist, create a new one
      createdColour = await Colour.create({ name: colour, hexColourCode })
    }

    // Create the product and associate it with the company
    product = await Product.create({
      ...req.body,
      companyId: createdCompany.id,
      colourId: createdColour.id,
    })

    // Add new images to the product
    const updatedPictures = await createPictures(images, product.id)
    await product.setProduct_pictures(updatedPictures)

    // Create variants
    const promises = variants.map(async (variant) => {
      if (variant.size) {
        const [size, sizeCreated] = await Size.findOrCreate({
          where: { name: variant.size },
        })

        const variantInstance = await ProductVariant.create({
          stock: parseInt(variant.stock),
        })

        await variantInstance.setProduct(product)
        await variantInstance.setSize(size)
        return variantInstance
      } else {
        return null // Skip creating the variant if color or size is empty
      }
    })

    await Promise.all(promises)
    res.status(StatusCodes.CREATED).json(product)
  } catch (error) {
    console.log(error)

    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      msg: 'Failed to create product',
    })
  }
}

const deleteProduct = async (req, res) => {
  const { id } = req.params
  const product = await Product.findByPk(id, {
    include: [
      {
        model: Picture,
        as: 'product_pictures',
        attributes: ['id', 'publicId'],
      },
    ],
  })
  if (!product) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json({ message: 'Product not found' })
  }
  // Delete associate images and product image
  const picturePromises = product.product_pictures.map(async (image) => {
    deletePicture(image.publicId)
  })
  await Promise.all(picturePromises)
  // const parsedImageData = product.image.map(JSON.parse);
  // const mainPicturePromises = parsedImageData.map(async (image) => {
  // 	deletePicture(image.publicId);
  // });

  // await Promise.all(mainPicturePromises);

  await product.destroy()
  res.status(StatusCodes.OK).json({ message: 'Success! Product removed.' })
}

const publishProduct = async (req, res) => {
  const id = req.params.id // Get the value of the "id" parameter from the URL

  try {
    const product = await Product.findByPk(id, {
      attributes: [
        'id',
        'published',
        // Add other attributes you want to fetch here
      ],
    })
    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Product not found' })
    }
    product.published = !product.published // Toggle the value of the published state
    await product.save() // Save the updated product
    return res.status(StatusCodes.OK).json({
      message: 'Product published state toggled successfully',
      productId: id,
      published: product.published,
    })
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to toggle the published state' })
  }
}

const featureProduct = async (req, res) => {
  const id = req.params.id // Get the value of the "id" parameter from the URL

  try {
    const product = await Product.findByPk(id, {
      attributes: [
        'id',
        'featured',
        // Add other attributes you want to fetch here
      ],
    })
    if (!product) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: 'Product not found' })
    }
    product.featured = !product.featured // Toggle the value of the published state
    await product.save() // Save the updated product
    return res.status(StatusCodes.OK).json({
      message: 'Product featured state toggled successfully',
      productId: id,
      featured: product.featured,
    })
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to toggle the published state' })
  }
}

const getRandomProducts = async (req, res) => {
  try {
    const randomProducts = await Product.findAll({
      attributes: ['id', 'name', 'price'],
      include: {
        model: Picture,
        as: 'product_pictures',
        attributes: ['url'],
      },
      where: {
        published: true, // Filter products by 'published'
        featured: true, // Filter products by 'featured'
      },
      order: Sequelize.literal('RANDOM()'), // For SQLite
      limit: 3,
    })

    // Transform the response to change 'product_pictures' to 'images'
    const modifiedProducts = randomProducts.map((product) => {
      const { id, name, price, product_pictures } = product

      const images = product_pictures.map((picture) => ({
        id: picture.id,
        publicId: picture.publicId,
        url: picture.url,
      }))

      return {
        id,
        name,
        price,
        images, // Transform 'product_pictures' to 'images' here
      }
    })

    return res.status(StatusCodes.OK).json(modifiedProducts)
  } catch (error) {
    console.error('Error fetching random products:', error)
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error })
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct,
  publishProduct,
  featureProduct,
  getRandomProducts,
}
