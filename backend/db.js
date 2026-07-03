const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://DuniyaKaPapa:aahAdminJi7714@inksprint.krnhh91.mongodb.net/?appName=InkSprint';
        const conn = await mongoose.connect(mongoUri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.log(`MongoDB Connection Error: ${error}`);
        process.exit(1);
    }
}

module.exports = connectDB;
