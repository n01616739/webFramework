const mongoose = require('mongoose');
const Airbnb = require('../models/airbnb'); // Import the schema

// Initialize the MongoDB connection
const initialize = async (connectionString) => {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: process.env.DB_NAME, // Dynamic database name from .env
    });
    console.log(`Connected to MongoDB database: ${process.env.DB_NAME}`);
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err);
    throw err;
  }
};

// Add a new Airbnb
const addNewAirBnB = async (data) => {
  try {
    const newAirbnb = new Airbnb(data);
    return await newAirbnb.save();
  } catch (err) {
    console.error('Failed to add new Airbnb:', err);
    throw err;
  }
};

// Get all Airbnbs with pagination and filtering
const getAllAirBnBs = async (page, perPage, property_type) => {
  try {
    const query = property_type ? { property_type } : {};
    const skip = (page - 1) * perPage;

    return await Airbnb.find(query)
      .sort({ _id: 1 })
      .skip(skip)
      .limit(perPage)
      .exec();
  } catch (err) {
    console.error('Failed to get Airbnbs:', err);
    throw err;
  }
};

// Get an Airbnb by ID
const getAirBnBById = async (id) => {
  try {
    return await Airbnb.findById(id).exec();
  } catch (err) {
    console.error('Failed to get Airbnb by ID:', err);
    throw err;
  }
};

// Update an Airbnb by ID
const updateAirBnBById = async (data, id) => {
  try {
    return await Airbnb.findByIdAndUpdate(id, data, { new: true }).exec();
  } catch (err) {
    console.error('Failed to update Airbnb by ID:', err);
    throw err;
  }
};

// Delete an Airbnb by ID
const deleteAirBnBById = async (id) => {
  try {
    return await Airbnb.findByIdAndDelete(id).exec();
  } catch (err) {
    console.error('Failed to delete Airbnb by ID:', err);
    throw err;
  }
};

module.exports = {
  initialize,
  addNewAirBnB,
  getAllAirBnBs,
  getAirBnBById,
  updateAirBnBById,
  deleteAirBnBById,
};
