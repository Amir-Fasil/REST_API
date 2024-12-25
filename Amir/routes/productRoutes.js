// routes/productRoutes.js
const express = require('express')
const router = express.Router()
const {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    updateProductPut,
    deleteProduct,
    headProducts,
} = require('../controllers/productController')

router.head('/', headProducts)
router.post('/', createProduct)
router.get('/', getAllProducts)
router.get('/:id', getProductById)
router.patch('/:id', updateProduct)
router.put('/:id', updateProductPut)
router.delete('/:id', deleteProduct)

module.exports = router
