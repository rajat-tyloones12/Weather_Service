const mongoose = require('mongoose');

const weatherSchema = new mongoose.Schema({
  cognitoUserId: {
    type: String,
    required: true,
    unique: true
  },

  favoriteCities:
    []  
  
});

const Weather = mongoose.model('Weather', weatherSchema);

module.exports = Weather;
