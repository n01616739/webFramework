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
const Airbnb = require('../models/airbnb');

const authenticateAdmin = require('../utils/authenticateAdmin');
// Define the schema
const airbnbIdSchema = Joi.object({
  id: Joi.string().required().min(3).max(50)
});

// Validation schema
// const addAirbnbSchema = Joi.object({
//   _id: Joi.string().required(),
//   listing_url: Joi.string().uri().required(),
//   name: Joi.string().required(),
//   description: Joi.string().required(),
//   property_type: Joi.string().required(),
//   room_type: Joi.string().required(),
//   accommodates: Joi.number().integer().min(1).required(),
//   price: Joi.number().min(0).required(),
// });

// Define the schema for validating query parameters
const querySchema = Joi.object({
  page: Joi.number().integer().positive().default(1), // Page number should be a positive integer
  perPage: Joi.number().integer().positive().default(5), // Results per page should be a positive integer
  property_type: Joi.string().optional(), // Property type is optional
});


const addAirbnbSchema = Joi.object({
  _id: Joi.string().min(3).max(30).required(), // Validate alphanumeric ID
  listing_url: Joi.string().uri().required(), // Ensure it's a valid URL
  name: Joi.string().min(3).max(100).required(), // Name length between 3 and 100 characters
  description: Joi.string().min(10).max(500).required(),
  room_type: Joi.string().min(3).max(50).required(), // Description length between 10 and 500 characters
  property_type: Joi.string().min(3).max(50).required(), // Property type length
  accommodates: Joi.number().integer().min(1).max(20).required(), // Between 1 and 20 guests
  price: Joi.number().min(0).max(10000).required(), // Price between $0 and $10,000
});



const updateAirbnbSchema = Joi.object({
  _id: Joi.string().min(3).max(30).optional(), // Make `_id` optional for updates
  listing_url: Joi.string().uri().optional(),
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(10).max(500).required(),
  room_type: Joi.string().min(3).max(50).required(),
  property_type: Joi.string().min(3).max(50).required(),
  accommodates: Joi.number().integer().min(1).max(20).optional(),
  price: Joi.number().min(0).max(10000).required(),
});


// // POST /api/AirBnBs - Add a new Airbnb and redirect with a success message
// router.post('/', async (req, res) => {
//   // Validate input data
//   const { error, value } = addAirbnbSchema.validate(req.body);
//   if (error) {
//     return res.status(400).render('error', {
//       message: 'Validation error',
//       error: error.details[0].message,
//     });
//   }

//   try {
//     // Add the new Airbnb to the database
//     await addNewAirBnB(value);

//     // Redirect with a success message
//     res.redirect('/?success=Airbnb added successfully!');
//   } catch (err) {
//     console.error('Failed to add new Airbnb:', err);
//     res.status(500).render('error', {
//       message: 'Failed to add Airbnb',
//       error: err.message,
//     });
//   }
// });

// Protected POST /api/AirBnBs/add - Only admins can add a new Airbnb
router.post('/add', authenticateAdmin, async (req, res) => {
  const { error, value } = addAirbnbSchema.validate(req.body);
  if (error) {
    return res.status(400).render('error', {
      message: 'Validation error',
      error: error.details[0].message,
    });
  }

  try {
    const duplicate = await Airbnb.findOne({
      $or: [{ _id: value._id }, { listing_url: value.listing_url }],
    });

    if (duplicate) {
      return res.status(400).render('error', {
        message: 'Duplicate record detected',
        error: 'A listing with the same ID or URL already exists.',
      });
    }

    await addNewAirBnB(value);
    res.redirect('/?success=Airbnb added successfully!');
  } catch (err) {
    console.error('Failed to add new Airbnb:', err);
    res.status(500).render('error', {
      message: 'Failed to add Airbnb',
      error: err.message,
    });
  }
});

// GET /api/AirBnBs/add - Serve the add listing form
router.get('/add', authenticateAdmin, (req, res) => {
  res.render('addAirbnb'); // Render the addAirbnb.ejs template
});






router.post('/', async (req, res) => {
  // Validate input data
  const { error, value } = addAirbnbSchema.validate(req.body);
  if (error) {
    // Render error page if validation fails
    return res.status(400).render('error', {
      message: 'Validation error',
      error: error.details[0].message, // Show field-specific validation error
    });
  }

  try {
    // Check for duplicate entries by `_id` or `listing_url`
    const duplicate = await Airbnb.findOne({
      $or: [{ _id: value._id }, { listing_url: value.listing_url }],
    });

    if (duplicate) {
      return res.status(400).render('error', {
        message: 'Duplicate record detected',
        error: 'A listing with the same ID or URL already exists.',
      });
    }

    // Add the new Airbnb to the database
    await addNewAirBnB(value);

    // Redirect with a success message
    res.redirect('/?success=Airbnb added successfully!');
  } catch (err) {
    console.error('Failed to add new Airbnb:', err);
    res.status(500).render('error', {
      message: 'Failed to add Airbnb',
      error: err.message,
    });
  }
});

// GET /api/AirBnBs/add - Serve the add listing form
router.get('/add', (req, res) => {
  res.render('addAirbnb'); // Renders the 'addAirbnb.ejs' template
});



///////////////////////////// Add to the database 

// Route to handle adding new Airbnb









// // GET /api/AirBnBs?page=1&perPage=5&property_type=Apartment
// router.get('/', async (req, res) => {
//   const { error, value } = querySchema.validate(req.query);
//   if (error) {
//     return res.status(400).json({ message: error.details[0].message });
//   }

//   const { page, perPage, property_type } = value;

//   try {
//     const results = await getAllAirBnBs(page, perPage, property_type);
//     res.status(200).json(results);
//   } catch (err) {
//     res.status(500).json({ message: 'Failed to fetch Airbnbs', error: err.message });
//   }
// });




// GET /api/AirBnBs?page=1&perPage=5&property_type=Apartment
router.get('/', async (req, res) => {
  const { error, value } = querySchema.validate(req.query);
  if (error) {
    return res.status(400).render('error', { message: error.details[0].message });
  }

  const { page, perPage, property_type } = value;

  try {
    // Fetch listings
    const listings = await getAllAirBnBs(page, perPage, property_type);

    // Render the home.ejs template with the listings, pagination data, and success message
    res.render('home', {
      listings, // Pass listings to the template
      page, // Current page number
      perPage, // Items per page
      success: req.query.success || null, // Pass success message if present
    });
  } catch (err) {
    res.status(500).render('error', { message: 'Failed to fetch Airbnbs', error: err.message });
  }
});


// GET /api/AirBnBs/form - Serve the search form
router.get('/form', (req, res) => {
  res.render('airbnbForm'); // Render the form page using template engine (e.g., EJS)
});





router.post('/form', async (req, res) => {
  // Validate query parameters using querySchema
  const { error, value } = querySchema.validate(req.body);

  if (error) {
    return res.status(400).render('error', {
      message: 'Validation Error',
      error: error.details[0].message, // Display specific validation error
    });
  }

  const { page, perPage, property_type } = value;

  try {
    // Fetch Airbnb listings from the database based on query parameters
    const results = await getAllAirBnBs(page, perPage, property_type);

    // Render the results page
    res.render('airbnbResults', { results });
  } catch (err) {
    console.error('Failed to fetch Airbnb listings:', err);
    res.status(500).render('error', {
      message: 'Failed to fetch listings',
      error: err.message,
    });
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
  const { id } = req.params;
  const data = req.body;

  try {
    const updatedAirbnb = await updateAirBnBById(data, id);

    if (!updatedAirbnb) {
      return res.status(404).render('error', {
        message: 'Airbnb not found',
        error: `No Airbnb found with ID ${id}`,
      });
    }

    // Render the `updatedAirbnb.ejs` file
    res.render('updatedAirbnb', { updatedAirbnb });
  } catch (err) {
    console.error('Error updating Airbnb:', err);
    res.status(500).render('error', {
      message: 'Failed to update Airbnb',
      error: err.message,
    });
  }
});





// GET /api/AirBnBs/:id/edit - Render the edit form for a specific Airbnb listing
router.get('/:id/edit', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch the Airbnb listing by ID
    const airbnb = await getAirBnBById(id);

    if (!airbnb) {
      return res.status(404).render('error', {
        message: 'Airbnb not found',
        error: `No Airbnb found with ID ${id}`,
      });
    }

    // Render the edit form with the fetched data
    res.render('editAirbnb', { listing: airbnb });
  } catch (err) {
    console.error('Failed to fetch Airbnb for editing:', err);
    res.status(500).render('error', {
      message: 'Failed to fetch Airbnb for editing',
      error: err.message,
    });
  }
});


// DELETE /api/AirBnBs/:id - Delete a specific Airbnb
router.delete('/:id',authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Attempt to delete the Airbnb by ID
    const deletedAirbnb = await deleteAirBnBById(id);

    if (!deletedAirbnb) {
      return res.status(404).render('error', {
        message: 'Airbnb Not Found',
        error: `No Airbnb found with ID ${id}`,
      });
    }

    // Render the success page with details of the deleted Airbnb
    res.render('deletedAirbnb', { deletedAirbnb });
  } catch (err) {
    console.error('Error deleting Airbnb:', err);
    res.status(500).render('error', {
      message: 'Failed to Delete Airbnb',
      error: err.message,
    });
  }
});

module.exports = router;
