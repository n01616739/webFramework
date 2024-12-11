// require('dotenv').config();
// const express = require('express');
// const path = require('path');
// const cors = require('cors');
// const cookieParser = require('cookie-parser'); // For handling cookies
// const jwt = require('jsonwebtoken'); // For user authentication
// const methodOverride = require('method-override');
// const { initialize, getAllAirBnBs } = require('./config/db-operation');
// const airbnbRoutes = require('./routes/airbnbRoutes');
// const authRoutes = require('./routes/auth'); // Import auth routes



// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(methodOverride('_method'));
// app.use(cookieParser()); // For handling JWT cookies

// // Set up template engine (EJS)
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// // Serve static files (CSS, images, etc.)
// app.use(express.static(path.join(__dirname, 'public')));

// // Load environment variables
// const connectionString = process.env.MONGO_URI;
// const port = process.env.PORT || 3000;

// // Middleware to add logged-in user to EJS templates
// app.use((req, res, next) => {
//   const token = req.cookies.authToken; // Assuming JWT is stored in cookies
//   if (token) {
//     try {
//       const user = jwt.verify(token, process.env.JWT_SECRET); // Decode JWT to get user info
//       res.locals.user = user; // Pass user data to templates
//     } catch (err) {
//       if (err.name === 'TokenExpiredError') {
//         console.error('Token has expired:', err.expiredAt);
//         res.locals.user = null; // Clear the user
//         res.clearCookie('authToken'); // Clear expired token from cookies
//         return res.redirect('/auth/login'); // Redirect to login
//       }
//       console.error('Invalid token:', err);
//       res.locals.user = null;
//     }
//   } else {
//     res.locals.user = null; // If no token, set user to null
//   }
//   next();
// });

// // Home route - Fetch listings dynamically based on query parameters (page, perPage)
// app.get('/', async (req, res) => {
//   const page = parseInt(req.query.page) || 1; // Default to page 1
//   const perPage = parseInt(req.query.perPage) || 5; // Default to 5 items per page
//   const success = req.query.success || null; // Capture success message from query string

//   try {
//     // Fetch listings based on page and perPage
//     let listings = await getAllAirBnBs(page, perPage);

//     // Sort listings: those with images first
//     listings = listings.sort((a, b) => (b.images && b.images.length > 0 ? 1 : -1));

//     // Render the home.ejs view and pass the listings, pagination data, success message, and user
//     res.render('home', { listings, page, perPage, success });
//   } catch (err) {
//     console.error('Error fetching listings:', err);
//     res.status(500).send('Error fetching listings');
//   }
// });

// // Add authentication routes
// app.use('/auth', authRoutes);

// // Add Airbnb-related routes
// app.use('/api/AirBnBs', airbnbRoutes);

// // Logout route
// app.get('/auth/logout', (req, res) => {
//   res.clearCookie('authToken'); // Clear JWT cookie
//   res.redirect('/'); // Redirect to home page
// });

// // Error handling for undefined routes
// app.use((req, res, next) => {
//   res.status(404).render('error', { message: 'Page not found' });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack); // Log the error for debugging
//   res.status(err.status || 500).render('error', {
//     message: err.message || 'An unexpected error occurred',
//     error: process.env.NODE_ENV === 'production' ? null : err.stack, // Show stack trace only in non-production
//   });
// });

// // Initialize database and start server
// (async () => {
//   try {
//     // Initialize MongoDB connection
//     await initialize(connectionString);
//     console.log('Database connected successfully');

//     // Start server
//     app.listen(port, () => {
//       console.log(`Server running on port ${port}`);
//     });
//   } catch (err) {
//     console.error('Failed to initialize application:', err);
//     process.exit(1);
//   }
// })();



require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // For handling cookies
const jwt = require('jsonwebtoken'); // For user authentication
const methodOverride = require('method-override');
const { initialize, getAllAirBnBs } = require('./config/db-operation');
const airbnbRoutes = require('./routes/airbnbRoutes');
const authRoutes = require('./routes/auth'); // Import auth routes

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser()); // For handling JWT cookies

// Set up template engine (EJS)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Load environment variables
const connectionString = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

// Middleware to add logged-in user to EJS templates
app.use((req, res, next) => {
  const token = req.cookies.authToken; // Assuming JWT is stored in cookies
  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET); // Decode JWT to get user info
      res.locals.user = user; // Pass user data to templates
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        console.error('Token has expired:', err.expiredAt);
        res.locals.user = null; // Clear the user
        res.clearCookie('authToken'); // Clear expired token from cookies
        return res.redirect('/auth/login'); // Redirect to login
      }
      console.error('Invalid token:', err);
      res.locals.user = null;
    }
  } else {
    res.locals.user = null; // If no token, set user to null
  }
  next();
});

// Middleware to enforce authentication
function ensureAuthenticated(req, res, next) {
  const token = req.cookies.authToken;
  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      req.user = user;
      return next();
    } catch (err) {
      console.error('Invalid or expired token:', err);
    }
  }
  res.redirect('/auth/login'); // Redirect to login if not authenticated
}

// Redirect root URL to login page if unauthenticated
app.get('/', ensureAuthenticated, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Default to page 1
    const perPage = parseInt(req.query.perPage) || 5; // Default to 5 items per page
    const success = req.query.success || null;

    // Fetch listings based on page and perPage
    let listings = await getAllAirBnBs(page, perPage);

    // Sort listings: those with images first
    listings = listings.sort((a, b) => (b.images && b.images.length > 0 ? 1 : -1));

    // Render the home page
    res.render('home', { listings, page, perPage, success });
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).send('Error fetching listings');
  }
});

// Add authentication routes
app.use('/auth', authRoutes);

// Add Airbnb-related routes (protected)
app.use('/api/AirBnBs', ensureAuthenticated, airbnbRoutes);

// Logout route
app.get('/auth/logout', (req, res) => {
  res.clearCookie('authToken'); // Clear JWT cookie
  res.redirect('/auth/login'); // Redirect to login page
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  res.status(err.status || 500).render('error', {
    message: err.message || 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? null : err.stack, // Show stack trace only in non-production
  });
});

// Initialize database and start server
(async () => {
  try {
    await initialize(connectionString); // Initialize database connection
    console.log('Database connected successfully');
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize application:', err);
    process.exit(1);
  }
})();
