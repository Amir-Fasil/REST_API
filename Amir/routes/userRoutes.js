// routes/userRoutes.js
const express = require('express')
const router = express.Router()
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    updateUserPut,
    deleteUser,
    headUsers,
} = require('../controllers/userController')

router.head('/', headUsers)
router.post('/', createUser)
router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.patch('/:id', updateUser)
router.put('/:id', updateUserPut)
router.delete('/:id', deleteUser)

module.exports = router
