const fs = require('fs')
const path = require('path')
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const csvParser = require('csv-parser')

const productFilePath = path.join(__dirname, '../db/products.csv')

// In-memory cache for products
let productCache = null

// Function to read products from CSV file and populate cache
const readProductsFromCsv = () => {
    return new Promise((resolve, reject) => {
        if (productCache) {
            return resolve(productCache) // Use cached data if available
        }
        const products = []
        fs.createReadStream(productFilePath)
            .pipe(csvParser())
            .on('data', (row) => {
                products.push({
                    id: parseInt(row.id),
                    name: row.name,
                    price: parseFloat(row.price),
                    description: row.description,
                })
            })
            .on('end', () => {
                productCache = products // Update cache
                resolve(products)
            })
            .on('error', (err) => {
                reject(err)
            })
    })
}

// Function to write products to CSV and update cache
const writeProductsToCsv = (products) => {
    const csvWriter = createCsvWriter({
        path: productFilePath,
        header: [
            { id: 'id', title: 'id' },
            { id: 'name', title: 'name' },
            { id: 'price', title: 'price' },
            { id: 'description', title: 'description' },
        ],
    })
    return csvWriter.writeRecords(products).then(() => {
        productCache = products // Refresh cache after writing
    })
}

// Create a new product
const createProduct = async (req, res) => {
    try {
        const { name, price, description } = req.body
        if (!name || !price || !description) {
            return res
                .status(400)
                .json({ error: 'Name, price, and description are required' })
        }

        const products = await readProductsFromCsv()
        const product = {
            id: products.length + 1,
            name,
            price: parseFloat(price),
            description,
        }
        products.push(product)

        await writeProductsToCsv(products)
        res.status(201).json(product)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create product' })
    }
}

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await readProductsFromCsv()
        res.json(products)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' })
    }
}

// Get product by ID
const getProductById = async (req, res) => {
    try {
        const products = await readProductsFromCsv()
        const product = products.find((p) => p.id === parseInt(req.params.id))
        if (!product)
            return res.status(404).json({ error: 'Product not found' })
        res.json(product)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' })
    }
}

// Update a product (partial update)
const updateProduct = async (req, res) => {
    try {
        const { name, price, description } = req.body
        const products = await readProductsFromCsv()
        const product = products.find((p) => p.id === parseInt(req.params.id))
        if (!product)
            return res.status(404).json({ error: 'Product not found' })

        if (name) product.name = name
        if (price) product.price = parseFloat(price)
        if (description) product.description = description

        await writeProductsToCsv(products)
        res.json(product)
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' })
    }
}

// Update a product (complete update)
const updateProductPut = async (req, res) => {
    try {
        const { name, price, description } = req.body
        if (!name || !price || !description) {
            return res
                .status(400)
                .json({ error: 'Name, price, and description are required' })
        }
        const products = await readProductsFromCsv()
        const product = products.find((p) => p.id === parseInt(req.params.id))
        if (!product)
            return res.status(404).json({ error: 'Product not found' })

        product.name = name
        product.price = parseFloat(price)
        product.description = description

        await writeProductsToCsv(products)
        res.json(product)
    } catch (error) {
        res.status(500).json({ error: 'Failed to update product' })
    }
}

// Delete a product
const deleteProduct = async (req, res) => {
    try {
        const products = await readProductsFromCsv()
        const productIndex = products.findIndex(
            (p) => p.id === parseInt(req.params.id)
        )
        if (productIndex === -1)
            return res.status(404).json({ error: 'Product not found' })

        products.splice(productIndex, 1)
        await writeProductsToCsv(products)
        res.json({ message: 'Product deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' })
    }
}

// HEAD method to check if products exist
const headProducts = async (req, res) => {
    try {
        const products = await readProductsFromCsv()
        if (products.length === 0) {
            return res.status(204).end() // No content
        }
        res.status(200).end() // Content exists
    } catch (error) {
        res.status(500).json({ error: 'Failed to check products' })
    }
}

module.exports = {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    updateProductPut,
    deleteProduct,
    headProducts, // Export the HEAD method
}
