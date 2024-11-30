require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initialize } = require('./config/db-operation');
const airbnbRoutes = require('./routes/airbnbRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Load environment variables
const connectionString = process.env.MONGO_URI;
const port = process.env.PORT || 3000;

// Initialize database and start server
(async () => {
  try {
    await initialize(connectionString);
    console.log('Database connected successfully');

    app.use('/api/AirBnBs', airbnbRoutes);

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (err) {
    console.error('Failed to initialize application:', err);
    process.exit(1);
  }
})();
