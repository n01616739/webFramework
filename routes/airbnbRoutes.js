const express = require('express');
const { pickFields } = require('../utils/utils');
const {
  addNewAirBnB,
  getAllAirBnBs,
  getAirBnBById,
  updateAirBnBById,
  deleteAirBnBById,
} = require('../config/db-operation');
const Joi = require('joi');

const router = express.Router();

// Validation schemas
const querySchema = Joi.object({
  page: Joi.number().integer().positive().default(1),
  perPage: Joi.number().integer().positive().default(10),
  property_type: Joi.string().optional(),
});

const airbnbIdSchema = Joi.object({
  id: Joi.string().required(),
});

// ----------------- API ROUTES ----------------- //

// POST /api/AirBnBs - Add a new Airbnb
router.post('/api', async (req, res) => {
  try {
    const result = await addNewAirBnB(req.body);
    res.status(201).json({ message: 'Airbnb added successfully', result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add Airbnb', error: err.message });
  }
});

// GET /api/AirBnBs?page=1&perPage=5&property_type=Apartment
router.get('/api', async (req, res) => {
  const { error, value } = querySchema.validate(req.query);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { page, perPage, property_type } = value;

  try {
    const results = await getAllAirBnBs(page, perPage, property_type);
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch Airbnbs', error: err.message });
  }
});

// GET /api/AirBnBs/:id - Get an Airbnb by ID
router.get('/api/:id', async (req, res) => {
  const { error } = airbnbIdSchema.validate(req.params);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const result = await getAirBnBById(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Airbnb not found' });
    }
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch Airbnb', error: err.message });
  }
});

// ----------------- UI ROUTES ----------------- //

// Default route for "/"
router.get('/', async (req, res) => {
  const { page = 1, perPage = 10, property_type } = req.query;

  try {
    const listings = await getAllAirBnBs(page, perPage, property_type);
    res.render('listings', { listings, page, perPage, property_type });
  } catch (error) {
    res.status(500).render('listings', { error: 'Failed to fetch listings' });
  }
});

// Render form for adding a new listing
router.get('/add-listing', (req, res) => {
  res.render('addListing');
});

// Handle form submission for adding a new listing
router.post('/add-listing', async (req, res) => {
  try {
    await addNewAirBnB(req.body);
    res.redirect('/');
  } catch (error) {
    res.status(500).render('addListing', { error: 'Failed to add listing' });
  }
});

// Render search form
router.get('/search', (req, res) => {
  res.render('searchForm', { listing: null, error: null });
});

// Handle search form submission and display the result
router.get('/search/listing', async (req, res) => {
  const { id } = req.query;

  try {
    const listing = await getAirBnBById(id);
    if (!listing) {
      return res.render('searchForm', { listing: null, error: 'Listing not found' });
    }

    res.render('searchForm', { listing, error: null });
  } catch (error) {
    res.render('searchForm', { listing: null, error: 'Failed to fetch listing' });
  }
});

// Render form for updating a listing
router.get('/update', (req, res) => {
  res.render('updateListing', { listing: null, error: null });
});

// Handle update request form
router.get('/update/:id', async (req, res) => {
  try {
    const listing = await getAirBnBById(req.params.id);
    if (!listing) {
      return res.render('updateListing', { listing: null, error: 'Listing not found' });
    }
    res.render('updateListing', { listing, error: null });
  } catch (error) {
    res.render('updateListing', { listing: null, error: 'Failed to fetch listing for update' });
  }
});

// Handle form submission for updating a listing
router.post('/update/:id', async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    const result = await updateAirBnBById(updatedData, id);
    if (!result) {
      return res.render('updateListing', { error: 'Failed to update listing', listing: null });
    }

    res.render('updateListing', { success: 'Listing updated successfully', listing: result });
  } catch (error) {
    res.render('updateListing', { error: 'Failed to update listing', listing: null });
  }
});

// Render form for deleting a listing
router.get('/delete', (req, res) => {
  res.render('deleteListing', { error: null });
});

// Handle form submission for deleting a listing
router.post('/delete', async (req, res) => {
  const { id } = req.body;

  try {
    const result = await deleteAirBnBById(id);
    if (!result) {
      return res.render('deleteListing', { error: 'Failed to delete listing' });
    }

    res.redirect('/');
  } catch (error) {
    res.render('deleteListing', { error: 'Failed to delete listing' });
  }
});

module.exports = router;
