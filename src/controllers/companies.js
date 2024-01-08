const { db } = require('../db/models')
const { Company, Product, Picture } = db.sequelize.models
const CustomError = require('../errors')
const { StatusCodes } = require('http-status-codes')
const cloudinary = require('cloudinary').v2

const getAllCompanies = async (req, res) => {
  try {
    // Fetch companies from your database or source
    const response = await Company.findAndCountAll()
    const count = response.count
    const rows = response.rows
    return res.status(200).json({ count, rows })
  } catch (error) {
    console.error(error) // Log the error for internal debugging

    // Depending on the error type, send an appropriate error message to the frontend
    let errorMessage = 'Internal Server Error'
    if (error instanceof ReferenceError) {
      errorMessage = 'CompanyX is not defined'
    } else {
      // For other types of errors, you might want to handle differently
      // You can customize this part based on your application's needs
      errorMessage = 'An error occurred while fetching companies'
    }

    return res.status(500).json({ msg: errorMessage })
  }
}

const getCompanyProducts = async (req, res) => {
  try {
    const name = req.params.brandName.replace(/-/g, ' ') // Convert back to space
    // Query the database to get products belonging to the specified brand
    console.log(name)
    const products = await Product.findAll({
      include: [
        {
          model: Company,
          as: 'company',
          where: {
            name,
          },
        },
        {
          model: Picture,
          as: 'product_pictures',
          attributes: ['id', 'publicId', 'url'],
        },
      ],
    })

    const updatedProductsList = products.map((product) => {
      const { product_pictures, ...rest } = product.toJSON() // Convert to JSON and extract other properties

      return {
        ...rest, // Add other properties as needed
        images: product_pictures, // Rename 'product_pictures' to 'images'
      }
    })

    res.status(200).json(updatedProductsList)
  } catch (error) {
    console.log(error)
    res.status(500).json(error)
  }
}
const getCompanyById = async (req, res) => {
  const { id } = req.params
  try {
    const company = await Company.findOne({
      where: {
        id,
      },
    })
    res.status(StatusCodes.OK).json(company)
  } catch (error) {
    console.log(error)
    return res.status(500).json(error)
  }
}

const updateCompany = async (req, res) => {
  const { id } = req.params // Extract the ID from request parameters
  const { name, url, publicId } = req.body // Extract name, URL, and publicId from request body
  
  try {
    // Fetch the existing company details
    const existingCompany = await Company.findByPk(id)

    if (!existingCompany) {
      return res.status(404).json({ msg: 'Company not found' })
    }

    // Prepare an object to store updated values
    const updatedFields = {}

    // Check if the name is different and update if needed
    if (existingCompany.name !== name) {
      updatedFields.name = name
    }

    // Check if URL is different and update both URL and publicId if needed
    if (existingCompany.url !== url) {
      updatedFields.url = url
      updatedFields.publicId = publicId
    }

    // If other fields need to be updated when they differ, add similar checks here
    // Update the company's details if any field is different
    if (Object.keys(updatedFields).length > 0) {
      await Company.update(updatedFields, { where: { id } })
      return res
        .status(200)
        .json({ status: 'ok', msg: 'Company details updated successfully' })
    } else {
      return res.status(200).json({ msg: 'No changes in company details' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ msg: 'Failed to update company details' })
  }
}

const removeImage = async (req, res) => {
  const { id } = req.params // Extract the ID from request parameters
  console.log('Removing id: ', id)
  const { publicId } = req.body
  console.log(publicId)
  try {
    const company = await Company.findByPk(id)
    const result = await cloudinary.uploader.destroy(publicId)
    company.publicId = null
    company.url = null
    await company.save()
    res.status(200).json({ msg: 'image was deleted' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: 'Failed to delete the image' })
  }
}

module.exports = {
  getAllCompanies,
  getCompanyProducts,
  getCompanyById,
  updateCompany,
  removeImage,
}
