require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initialize, getAllAirBnBs } = require('./config/db-operation');
const airbnbRoutes = require('./routes/airbnbRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up template engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Load environment variables
const connectionString = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

// Home route - Fetch listings dynamically based on query parameters (page, perPage)
app.get('/', async (req, res) => {
  // Read query parameters (default to page 1 and perPage 5 if not provided)
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 5;
  const success = req.query.success || null; // Capture success message from query string

  try {
    // Fetch listings based on page and perPage
    let listings = await getAllAirBnBs(page, perPage);

    // Sort listings: those with images first
    listings = listings.sort((a, b) => (b.images && b.images.length > 0 ? 1 : -1));

    // Render the home.ejs view and pass the listings, pagination data, and success message
    res.render('home', { listings, page, perPage, success });
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).send('Error fetching listings');
  }
});

// Initialize database and start server
(async () => {
  try {
    // Initialize MongoDB connection
    await initialize(connectionString);
    console.log('Database connected successfully');

    // Set up routes
    app.use('/api/AirBnBs', airbnbRoutes);

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize application:', err);
    process.exit(1);
  }
})();
