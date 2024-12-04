require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initialize } = require('./config/db-operation');
const airbnbRoutes = require('./routes/airbnbRoutes');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing form data

// Set up Handlebars as the template engine
app.set('view engine', 'hbs'); // Use Handlebars
app.set('views', path.join(__dirname, 'views')); // Set the views directory

// Serve static files (CSS, JS, images)
app.use(express.static(path.join(__dirname, 'public')));

// Load environment variables
const connectionString = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

// Initialize database and start server
(async () => {
  try {
    await initialize(connectionString); // Initialize MongoDB
    console.log('Database connected successfully');

    // Mount routes
    app.use('/', airbnbRoutes); // Use the routes for API and UI

    // Start the server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize application:', err);
    process.exit(1);
  }
})();
