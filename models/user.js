const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: { type: String, default: 'user' } // Default role is 'user'
});

module.exports = mongoose.model('User', userSchema);
