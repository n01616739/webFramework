require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initialize, getAllAirBnBs } = require('./config/db-operation'); // Assuming getAllAirBnBs is available
const airbnbRoutes = require('./routes/airbnbRoutes');

const app = express();
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

  try {
    let listings = await getAllAirBnBs(page, perPage); // Fetch listings based on page and perPage

    // Sort listings: those with images first
    listings = listings.sort((a, b) => {
      return b.images && b.images.length > 0 ? 1 : -1; // Ensure listings with images appear first
    });

    res.render('home', { listings, page, perPage }); // Pass listings and pagination data to the view
  } catch (err) {
    res.status(500).send('Error fetching listings');
  }
});

// Initialize database and start server
(async () => {
  try {
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
