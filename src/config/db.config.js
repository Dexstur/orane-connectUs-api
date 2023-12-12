const mongoose = require('mongoose');
const { config } = require('dotenv');

config();

const URI = process.env.MONGO_URI || '';
const password = process.env.MONGO_PASSWORD || '';
const connectionString = URI.replace('<password>', password);

async function connectDB() {
  try {
    await mongoose.connect(connectionString);
    console.log(`Db connected`);
  } catch (err) {
    console.error(err.message);
    console.error(`Db connection failed`);
  }
}

module.exports = connectDB;
