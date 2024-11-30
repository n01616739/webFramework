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

// POST /api/AirBnBs - Add a new Airbnb
router.post('/', async (req, res) => {
  try {
    const result = await addNewAirBnB(req.body);
    res.status(201).json({ message: 'Airbnb added successfully', result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add Airbnb', error: err.message });
  }
});

// GET /api/AirBnBs?page=1&perPage=5&property_type=Apartment
router.get('/', async (req, res) => {
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
router.get('/:id', async (req, res) => {
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


// GET /api/AirBnBs/review/:id - Retrieve reviews for a specific AirBnB
router.get('/review/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const airbnb = await getAirBnBById(id);

    if (!airbnb) {
      return res.status(404).json({ message: 'Airbnb not found' });
    }

    // Return only the specified review-related fields
    const result = {
      number_of_reviews: airbnb.number_of_reviews,
      first_review: airbnb.first_review,
      last_review: airbnb.last_review,
      reviews: airbnb.reviews?.map((review) => ({
        review_date: review.date,
        comment: review.comment,
      })) || [],
    };

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: err.message });
  }
});

/// GET /api/AirBnBs/:id - Retrieve a specific AirBnB with selected fields



router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const airbnb = await getAirBnBById(id);

    if (!airbnb) {
      return res.status(404).json({ message: 'Airbnb not found' });
    }

    const selectedFields = [
      'listing_url',
      'description',
      'neighborhood_overview',
      'cancellation_policy',
      'property_type',
      'room_type',
      'accommodates',
      'price',
      'images',
    ];

    const result = pickFields(airbnb, selectedFields);

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch Airbnb', error: err.message });
  }
});


// PUT /api/AirBnBs/:id - Update a specific AirBnB
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await updateAirBnBById(data, id);

    if (!result) {
      return res.status(404).json({ message: 'Airbnb not found' });
    }

    res.status(200).json({ message: 'Airbnb updated successfully', result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update Airbnb', error: err.message });
  }
});


// DELETE /api/AirBnBs/:id - Delete a specific AirBnB
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await deleteAirBnBById(id);

    if (!result) {
      return res.status(404).json({ message: 'Airbnb not found' });
    }

    res.status(204).send(); // No content
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete Airbnb', error: err.message });
  }
});

module.exports = router;
