const mongoose = require('mongoose');
require('dotenv').config();

// Get MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://amanchaudhary1511:aman123@cluster0.vrc2c1f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Try to connect to MongoDB
try {
  mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  mongoose.connection.on('connected', () => {
    console.log('MongoDB Connected');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  
  module.exports = mongoose.connection;
} catch (error) {
  console.error('Failed to connect to MongoDB:', error.message);
  module.exports = null;
} 