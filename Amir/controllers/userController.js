const fs = require('fs')
const path = require('path')
const createCsvWriter = require('csv-writer').createObjectCsvWriter
const csvParser = require('csv-parser')

const userFilePath = path.join(__dirname, '../db/users.csv')

// In-memory cache for users
let userCache = null

// Function to read users from CSV file and populate cache
const readUsersFromCsv = () => {
    return new Promise((resolve, reject) => {
        if (userCache) {
            return resolve(userCache) // Use cached data if available
        }
        const users = []
        fs.createReadStream(userFilePath)
            .pipe(csvParser())
            .on('data', (row) => {
                users.push({
                    id: parseInt(row.id), // Map ID field from CSV
                    name: row.name, // Map Name field from CSV
                })
            })
            .on('end', () => {
                userCache = users // Update cache
                resolve(users)
            })
            .on('error', (err) => {
                reject(err)
            })
    })
}

// Function to write users to CSV and update cache
const writeUsersToCsv = (users) => {
    const csvWriter = createCsvWriter({
        path: userFilePath,
        header: [
            { id: 'id', title: 'id' },
            { id: 'name', title: 'name' },
        ],
    })
    return csvWriter.writeRecords(users).then(() => {
        userCache = users // Refresh cache after writing
    })
}

// Create a new user
const createUser = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ error: 'Name is required' })
        }

        const users = await readUsersFromCsv()
        const user = { id: users.length + 1, name: req.body.name }
        users.push(user)

        await writeUsersToCsv(users)
        res.status(201).json(user)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' })
    }
}

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await readUsersFromCsv()
        res.json(users)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' })
    }
}

// Get user by ID
const getUserById = async (req, res) => {
    try {
        const users = await readUsersFromCsv()
        const user = users.find((u) => u.id === +req.params.id)
        if (!user) return res.status(404).json({ error: 'User not found' })
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch user' })
    }
}

// Update a user (partial update)
const updateUser = async (req, res) => {
    try {
        const users = await readUsersFromCsv()
        const user = users.find((u) => u.id === +req.params.id)
        if (!user) return res.status(404).json({ error: 'User not found' })

        if (req.body.name) {
            user.name = req.body.name
        }
        await writeUsersToCsv(users)
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' })
    }
}

// Update a user (complete update)
const updateUserPut = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ error: 'Name is required' })
        }
        const users = await readUsersFromCsv()
        const user = users.find((u) => u.id === +req.params.id)
        if (!user) return res.status(404).json({ error: 'User not found' })

        user.name = req.body.name
        await writeUsersToCsv(users)
        res.json(user)
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' })
    }
}

// Delete a user
const deleteUser = async (req, res) => {
    try {
        const users = await readUsersFromCsv()
        const userIndex = users.findIndex((u) => u.id === +req.params.id)
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' })
        }

        users.splice(userIndex, 1)
        await writeUsersToCsv(users)
        res.json({ message: 'User deleted successfully' })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' })
    }
}

// HEAD method to check if users exist
const headUsers = async (req, res) => {
    try {
        const users = await readUsersFromCsv()
        if (users.length === 0) {
            return res.status(204).end() // No content
        }
        res.status(200).end() // Content exists
    } catch (error) {
        res.status(500).json({ error: 'Failed to check users' })
    }
}

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    updateUserPut,
    deleteUser,
    headUsers, // Export the HEAD method
}
