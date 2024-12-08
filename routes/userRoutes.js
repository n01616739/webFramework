const express = require('express');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { pickFields } = require('../utils/utils');
const { route } = require('./airbnbRoutes');


const router = express.Router();

const generateApiKey = () => { 
    return require('crypto').randomBytes(16).toString('hex');
};



//middleware to authenticate user and check their roles

const authenticateUser = (roles)=>{
    return (req,res,next)=>{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if(!token)
            return res.sendStatus(401);
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user)=>{
            if(err)
                if (err) return res.sendStatus(403);
            req.user = user;

            //check user has any roles
            if (!roles.some((role) => user.roles.includes(role))) {
                return res.sendStatus(403); // Forbidden
              }

            next();
        });
    };
};


//Route for register new user
router.get('/register', (req, res) => {
  res.render('register', {
      body: '<%- include("register") %>', 
      title: 'Register - Airbnb Search'
  });
});


router.post('/register', async (req, res) => {
  const { username, password, roles } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      password: hashedPassword,
      roles: roles || ['user'],  // Default to 'user' role
    });

    await newUser.save();
    // Redirect to login page after successful registration
    res.redirect('/');
  } catch (error) {
    res.status(500).json({ message: 'Error registering user' });
  }
});


//Route for login
router.get('/login', (req, res) => {
  res.render('login', {
      body: '<%- include("login") %>', 
      title: 'Login - Airbnb Search'
  });
});


router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  console.log('Received login request with username:', username);
  console.log('Received login request with password:', password);

  try {
    // Find user by username
    const user = await User.findOne({ username });
    console.log('User found in database:', user);

    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Compare provided password with stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password comparison result:', isMatch);

    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username, roles: user.roles },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '1h' }
    );
    console.log('JWT token created:', token);

    // Set the JWT token in an HTTP-only cookie
    res.cookie('auth_token', token, {
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', // Using secure cookies in production
      maxAge: 1000 * 60 * 60, // 1 hour
      sameSite: 'Strict', // Cookie is only sent in first-party context
    });

    // Redirect the user after successful login
    res.redirect('/');

  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ message: 'Error logging in' });
  }
});



router.get('/logout', (req, res) => {
  console.log('Session before logout:', req.session); // Check session data
  
  // Clear the JWT token cookie
  res.clearCookie('auth_token', { path: '/' });

  // Destroy the session
  req.session.destroy((err) => {
    if (err) {
      console.log('Error destroying session:', err);
    } else {
      console.log('Session destroyed');
    }

    // Clear session cookie (connect.sid)
    res.clearCookie('connect.sid', { path: '/' });

    // Redirect after logout
    res.redirect('/');
  });
});



    module.exports=router;