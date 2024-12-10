const mongoose = require('mongoose');

// Define the schema for the "listingsAndReviews" collection
const airbnbSchema = new mongoose.Schema(
  {
    _id: { type: String, unique: true },
    listing_url: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    summary: { type: String, optional: true },
    space: { type: String, optional: true },
    description: { type: String, required: true },
    neighborhood_overview: { type: String, optional: true },
    notes: { type: String, optional: true },
    transit: { type: String, optional: true },
    access: { type: String, optional: true },
    interaction: { type: String, optional: true },
    house_rules: { type: String, optional: true },
    property_type: { type: String, required: true },
    room_type: { type: String, required: true },
    bed_type: { type: String, optional: true },
    minimum_nights: { type: String, optional: true },
    maximum_nights: { type: String, optional: true },
    cancellation_policy: { type: String, optional: true },
    last_scraped: { type: Date, optional: true },
    calendar_last_scraped: { type: Date, optional: true },
    first_review: { type: Date, optional: true },
    last_review: { type: Date, optional: true },
    accommodates: { type: Number, required: true },
    bedrooms: { type: Number, optional: true },
    beds: { type: Number, optional: true },
    number_of_reviews: { type: Number, optional: true },
    bathrooms: { type: Number, optional: true },
    amenities: { type: [String], optional: true },
    price: { type: Number, required: true },
    security_deposit: { type: Number, optional: true },
    cleaning_fee: { type: Number, optional: true },
    extra_people: { type: Number, optional: true },
    guests_included: { type: Number, optional: true },
    images: { type: Object, optional: true },
    host: { type: Object, optional: true },
    address: { type: Object, optional: true },
    availability: { type: Object, optional: true },
    review_scores: { type: Object, optional: true },
    reviews: { type: [Object], optional: true },
  },
  { collection: 'listingsAndReviews' } // Explicitly specify the collection name
);

module.exports = mongoose.model('Airbnb', airbnbSchema, 'listingsAndReviews'); // Bind to specific collection
