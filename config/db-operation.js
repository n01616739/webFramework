const { MongoClient } = require('mongodb');

let db;
let collection;

// Initialize the connection with MongoDB Atlas
const initialize = async (connectionString, dbName, collectionName) => {
  try {
    const client = new MongoClient(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect();
    db = client.db(dbName); // Use the database dynamically
    collection = db.collection(collectionName); // Use the collection dynamically
    console.log(`Connected to database: ${dbName}, collection: ${collectionName}`);
  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas:', err);
    throw err;
  }
};

// Add a new document
const addNewDocument = async (data) => {
  try {
    const result = await collection.insertOne(data);
    return result;
  } catch (err) {
    console.error('Failed to add new document:', err);
    throw err;
  }
};

// Get all documents with pagination and optional filtering
const getAllDocuments = async (page, perPage, filter = {}) => {
  try {
    const cursor = collection
      .find(filter)
      .sort({ _id: 1 })
      .skip((page - 1) * perPage)
      .limit(perPage);
    const results = await cursor.toArray();
    return results;
  } catch (err) {
    console.error('Failed to get documents:', err);
    throw err;
  }
};

// Get a single document by ID
const getDocumentById = async (id) => {
  try {
    const result = await collection.findOne({ _id: id });
    return result;
  } catch (err) {
    console.error('Failed to get document by ID:', err);
    throw err;
  }
};

// Update a document by ID
const updateDocumentById = async (data, id) => {
  try {
    const result = await collection.updateOne({ _id: id }, { $set: data });
    return result;
  } catch (err) {
    console.error('Failed to update document by ID:', err);
    throw err;
  }
};

// Delete a document by ID
const deleteDocumentById = async (id) => {
  try {
    const result = await collection.deleteOne({ _id: id });
    return result;
  } catch (err) {
    console.error('Failed to delete document by ID:', err);
    throw err;
  }
};

// Switch the collection dynamically
const switchCollection = async (newCollectionName) => {
    try {
      // Validate if the collection exists
      const collections = await db.listCollections({}, { nameOnly: true }).toArray();
      const collectionNames = collections.map((col) => col.name);
  
      if (!collectionNames.includes(newCollectionName)) {
        throw new Error(`Collection '${newCollectionName}' does not exist.`);
      }
  
      // Switch to the new collection
      collection = db.collection(newCollectionName);
      console.log(`Switched to collection: ${newCollectionName}`);
      return `Switched to collection: ${newCollectionName}`;
    } catch (err) {
      console.error('Failed to switch collection:', err);
      throw err;
    }
  };
  

module.exports = {
  initialize,
  addNewDocument,
  getAllDocuments,
  getDocumentById,
  updateDocumentById,
  deleteDocumentById,
  switchCollection,
};
