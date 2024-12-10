const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Import User model
const router = express.Router();

const secretKey = process.env.JWT_SECRET || 'defaultSecretKey';


router.post('/refresh-token', (req, res) => {
    const token = req.cookies.authToken;
  
    if (!token) {
      return res.status(401).send('No token provided');
    }
  
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true }); // Decode expired token
      const newToken = jwt.sign(
        { id: payload.id, username: payload.username, role: payload.role },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } // Set new expiration time
      );
      res.cookie('authToken', newToken, { httpOnly: true });
      res.send('Token refreshed');
    } catch (err) {
      console.error('Error refreshing token:', err);
      res.status(403).send('Invalid token');
    }
  });
  

// Render Register Page
router.get('/register', (req, res) => {
    console.log('Register route accessed');
    res.render('register');});

// Render Login Page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle User Registration
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).render('error', {
        message: 'User already exists',
        error: 'Please choose a different username'
      });
    }
  
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
  
    // Automatically set role to admin if username is 'admin'
    const role = username.toLowerCase() === 'admin' ? 'admin' : 'user';
  
    // Create the new user
    const newUser = new User({
      username,
      password: hashedPassword,
      role
    });
  
    try {
      await newUser.save();
      res.redirect('/auth/login');
    } catch (err) {
      res.status(500).render('error', {
        message: 'Failed to register user',
        error: err.message
      });
    }
  });
  

// Handle User Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    const user = await User.findOne({ username });
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role }, // Include role in the token
        process.env.JWT_SECRET || 'defaultSecretKey',
        { expiresIn: '1h' }
      );
      res.cookie('authToken', token, { httpOnly: true });
      res.redirect('/');
    } else {
      res.status(401).render('error', { message: 'Invalid username or password' });
    }
  });
  


module.exports = router;
