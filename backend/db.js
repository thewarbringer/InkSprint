const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://DuniyaKaPapa:aahAdminJi7714@inksprint.krnhh91.mongodb.net/?appName=InkSprint';
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.log(`MongoDB Connection Error: ${error.message}`);
        // Don't exit - allow server to start even if DB is not available
        // Try to reconnect every 5 seconds
        setTimeout(() => {
            console.log('Attempting to reconnect to MongoDB...');
            connectDB();
        }, 5000);
    }
}

module.exports = connectDB;
