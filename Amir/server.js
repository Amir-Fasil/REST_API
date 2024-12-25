// server.js
const express = require('express')
const cors = require('cors')
const app = express()
const productRoutes = require('./routes/productRoutes')
const userRoutes = require('./routes/userRoutes')
const PORT = 5000

// Middleware
app.use(express.json())

// Routes
app.use('/product', productRoutes)
app.use('/user', userRoutes)

app.use(cors())
// Start Server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})
