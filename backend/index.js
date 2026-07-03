require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./db.js')

const app = express()

app.use(cors())
app.use(express.json())

// Initialize MongoDB connection
connectDB();

const authRoutes = require('./routes/authRoutes');
const activeGameRoutes = require('./routes/activeGameRoutes');
app.use('/api/auth', authRoutes);
app.use('/api/active-game', activeGameRoutes);

app.get('/', (req, res) => {
    res.send('hello')
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
