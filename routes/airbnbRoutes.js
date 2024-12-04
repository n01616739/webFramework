const express = require('express');
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

// Add a new Airbnb
router.post('/api', async (req, res) => {
  try {
    const result = await addNewAirBnB(req.body);
    res.status(201).json({ message: 'Airbnb added successfully', result });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add Airbnb', error: err.message });
  }
});

// Get a paginated list of Airbnbs
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

// Get an Airbnb by ID
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

// Home route with paginated listings
router.get('/', async (req, res) => {
  const { page = 1, perPage = 12, property_type } = req.query;

  try {
    const listings = await getAllAirBnBs(page, perPage, property_type);
    const formattedListings = listings.map((listing) => ({
      id: listing._id,
      imageUrl: listing.images?.picture_url || '/images/default.png',
      title: listing.name || 'No Title Available',
      description: listing.description
        ? listing.description.substring(0, 100) + '...'
        : 'No Description Available',
    }));

    res.render('listings', { listings: formattedListings });
  } catch (error) {
    res.status(500).render('listings', { error: 'Failed to fetch listings' });
  }
});

// Add new listing form
router.get('/add-listing', (req, res) => {
  res.render('addListing');
});

router.post('/add-listing', async (req, res) => {
  const {
    _id,
    listing_url,
    name,
    description,
    property_type,
    room_type,
    accommodates,
    price,
    // Optional fields
    summary,
    space,
    neighborhood_overview,
    notes,
    transit,
    access,
    interaction,
    house_rules,
    bed_type,
    minimum_nights,
    maximum_nights,
    cancellation_policy,
    last_scraped,
    calendar_last_scraped,
    first_review,
    last_review,
    bedrooms,
    beds,
    number_of_reviews,
    bathrooms,
    amenities,
    security_deposit,
    cleaning_fee,
    extra_people,
    guests_included,
    images,
    host,
    address,
    availability,
    review_scores,
    reviews,
  } = req.body;

  // Validate required fields
  if (
    !_id ||
    !listing_url ||
    !name ||
    !description ||
    !property_type ||
    !room_type ||
    !accommodates ||
    !price
  ) {
    return res.render('addListing', {
      error: 'Please fill in all required fields.',
    });
  }

  try {
    // Prepare the data for insertion
    const listingData = {
      _id,
      listing_url,
      name,
      description,
      property_type,
      room_type,
      accommodates: parseInt(accommodates, 10), // Ensure numeric values
      price: parseFloat(price),
      // Optional fields
      summary,
      space,
      neighborhood_overview,
      notes,
      transit,
      access,
      interaction,
      house_rules,
      bed_type,
      minimum_nights,
      maximum_nights,
      cancellation_policy,
      last_scraped: last_scraped ? new Date(last_scraped) : undefined,
      calendar_last_scraped: calendar_last_scraped ? new Date(calendar_last_scraped) : undefined,
      first_review: first_review ? new Date(first_review) : undefined,
      last_review: last_review ? new Date(last_review) : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms, 10) : undefined,
      beds: beds ? parseInt(beds, 10) : undefined,
      number_of_reviews: number_of_reviews ? parseInt(number_of_reviews, 10) : undefined,
      bathrooms: bathrooms ? parseFloat(bathrooms) : undefined,
      amenities: amenities ? amenities.split(',') : undefined, // Convert comma-separated string to array
      security_deposit: security_deposit ? parseFloat(security_deposit) : undefined,
      cleaning_fee: cleaning_fee ? parseFloat(cleaning_fee) : undefined,
      extra_people: extra_people ? parseFloat(extra_people) : undefined,
      guests_included: guests_included ? parseInt(guests_included, 10) : undefined,
      images,
      host,
      address,
      availability,
      review_scores,
      reviews,
    };

    // Insert the data into the database
    await addNewAirBnB(listingData);

    // Render the success message
    res.render('addListing', { success: 'Listing added successfully!' });
  } catch (err) {
    console.error('Error adding listing:', err.message);

    // Render an error message if the database operation fails
    res.render('addListing', { error: 'Failed to add listing. Please try again.' });
  }
});



// View details of a specific listing
router.get('/details/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const listing = await getAirBnBById(id);
    if (!listing) {
      return res.status(404).render('details', { error: 'Listing not found' });
    }

    const selectedFields = {
      _id: listing._id,
      listing_url: listing.listing_url,
      summary: listing.summary,
      space: listing.space,
      description: listing.description,
      neighborhood_overview: listing.neighborhood_overview,
      notes: listing.notes,
      transit: listing.transit,
      accommodates: listing.accommodates,
      bedrooms: listing.bedrooms,
      beds: listing.beds,
      imageUrl: listing.images?.picture_url || '/images/default.png',
    };

    res.render('details', { listing: selectedFields });
  } catch (error) {
    res.status(500).render('details', { error: 'Failed to fetch listing details' });
  }
});

// Search form
router.get('/search', (req, res) => {
  res.render('searchListing', { listing: null, error: null });
});

// Handle search form submission
router.get('/search/listing', async (req, res) => {
  const { id } = req.query;

  try {
    const listing = await getAirBnBById(id);
    if (!listing) {
      return res.render('searchListing', { listing: null, error: 'Listing not found' });
    }

    const selectedFields = {
      _id: listing._id,
      listing_url: listing.listing_url,
      name: listing.name || 'No Name Provided',
      description: listing.description || 'No Description Available',
      summary: listing.summary || 'No Summary Available',
      space: listing.space || 'No Space Details',
      neighborhood_overview: listing.neighborhood_overview || 'No Overview Available',
      notes: listing.notes || 'No Notes Provided',
      transit: listing.transit || 'No Transit Info',
      accommodates: listing.accommodates || 'N/A',
      bedrooms: listing.bedrooms || 'N/A',
      beds: listing.beds || 'N/A',
      imageUrl: listing.images?.picture_url || '/images/default.png',
    };

    res.render('searchListing', { listing: selectedFields, error: null });
  } catch (error) {
    res.render('searchListing', { listing: null, error: 'Failed to fetch listing' });
  }
});

// Update listing form
router.get('/update', (req, res) => {
  res.render('updateListing', { listing: null, error: null });
});

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

// Delete listing form
router.get('/delete', (req, res) => {
  res.render('deleteListing', { error: null });
});

// Handle form submission for deleting a listing
router.post('/delete', async (req, res) => {
  const { id } = req.body;

  try {
    const result = await deleteAirBnBById(id);
    if (!result) {
      return res.render('deleteListing', { error: 'No listing found with the provided ID.' });
    }

    res.render('deleteListing', { success: 'Listing deleted successfully!' });
  } catch (error) {
    res.render('deleteListing', { error: 'Failed to delete listing.' });
  }
});

module.exports = router;
