require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const {
    initialize,
    addNewDocument,
    switchCollection,
    getAllDocuments,
    getDocumentById,
    updateDocumentById,
    deleteDocumentById,
  } = require('./config/db-operation'); 

const app = express();
app.use(express.json()); // Middleware to parse JSON requests

// Retrieve environment variables
const connectionString = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;
const collectionName = process.env.COLLECTION_NAME;
const port = process.env.PORT || 3000;

(async () => {
  try {
    // Initialize MongoDB connection
    await initialize(connectionString, dbName, collectionName);

    // API routes

    // Home route
    app.get('/', (req, res) => {
      res.send('Welcome to AirBnb Listings');
    });

    // Add a new document
    app.post('/documents', async (req, res) => {
      try {
        const result = await addNewDocument(req.body);
        res.status(201).json({ message: 'Document added successfully', result });
      } catch (err) {
        res.status(500).json({ message: 'Failed to add document', error: err.message });
      }
    });

    // Get all documents with optional filter
    app.get('/documents', async (req, res) => {
      const { page = 1, perPage = 10, filter = '{}' } = req.query;
      try {
        const results = await getAllDocuments(
          parseInt(page),
          parseInt(perPage),
          JSON.parse(filter)
        );
        res.status(200).json(results);
      } catch (err) {
        res.status(500).json({ message: 'Failed to fetch documents', error: err.message });
      }
    });

    // Get a document by ID
    app.get('/documents/:id', async (req, res) => {
      try {
        const result = await getDocumentById(req.params.id);
        if (!result) {
          return res.status(404).json({ message: 'Document not found' });
        }
        res.status(200).json(result);
      } catch (err) {
        res.status(500).json({ message: 'Failed to fetch document', error: err.message });
      }
    });

    // Update a document by ID
    app.put('/documents/:id', async (req, res) => {
      try {
        const result = await updateDocumentById(req.body, req.params.id);
        res.status(200).json({ message: 'Document updated successfully', result });
      } catch (err) {
        res.status(500).json({ message: 'Failed to update document', error: err.message });
      }
    });

    // Delete a document by ID
    app.delete('/documents/:id', async (req, res) => {
      try {
        const result = await deleteDocumentById(req.params.id);
        res.status(200).json({ message: 'Document deleted successfully', result });
      } catch (err) {
        res.status(500).json({ message: 'Failed to delete document', error: err.message });
      }
    });

    app.post('/switch-collection', async (req, res) => {
        const { newCollection } = req.body; // Expect the new collection name in the request body
      
        if (!newCollection) {
          return res.status(400).json({ message: 'Please provide a collection name to switch to.' });
        }
      
        try {
          const message = await switchCollection(newCollection);
          res.status(200).json({ message });
        } catch (err) {
          res.status(500).json({ message: 'Failed to switch collections', error: err.message });
        }
      });
      

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize application:', err);
    process.exit(1);
  }
})();
