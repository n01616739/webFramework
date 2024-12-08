require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const { initialize, getAllAirBnBs } = require('./config/db-operation');
const airbnbRoutes = require('./routes/airbnbRoutes');
const userRoutes = require('./routes/userRoutes');
const User = require('./models/user');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const session = require('express-session');

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

// Function to create the first admin if not already present
const createFirstAdmin = async () => {
  try {
    const adminExists = await User.findOne({ roles: 'admin' });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin', 10);

      const firstAdmin = new User({
        username: 'admin',
        password: hashedPassword,
        roles: ['admin'],
      });

      await firstAdmin.save();
      console.log('First admin created successfully.');
    } else {
      console.log('Admin already exists, skip creation.');
    }
  } catch (error) {
    console.error('Error creating first admin:', error);
  }
};

// Cookie parser for reading cookies
app.use(cookieParser())

// Session configuration 
app.use(session({
  secret: 'gsbhsbjhnanb', //secret key
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',  // Use secure cookies in production
    maxAge: 1000 * 60 * 60 * 24,  // 1 day
  }
}));



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

    // Create the first admin if none exists
    await createFirstAdmin();

    // Set up routes
    app.use('/api/AirBnBs', airbnbRoutes);
    app.use('/api/users', userRoutes);

    // Start server
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize application:', err);
    process.exit(1);
  }
})();
