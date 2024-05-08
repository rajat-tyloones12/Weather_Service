const express= require('express');
const router = express.Router();
const Weather = require('../models/Weather');
const Verification = require('../middleware/Verification');
const { CognitoIdentityServiceProvider } = require('aws-sdk');
const dotenv= require('dotenv');
dotenv.config();


const cognito = new CognitoIdentityServiceProvider({ 
  region: process.env.AWS_REGION ,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

router.post('/add-to-favorites',Verification, async (req, res) => {
  try {
    const { cityName } = req.body;
    const { cognitoUserId } = req.user.cognitoUserId;

    //  if (!cognitoUserId) {
    //   return res.status(401).json({ message: 'User not authenticated' });
    // }

   
    const user = await Weather.findOne({ cognitoUserId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the city already exists in favorite cities
    if (user.favoriteCities.includes(cityName)) {
      return res.status(400).json({ message: 'City already in favorites' });
    }

    // Add the city to favorite cities and save
    user.favoriteCities.push(cityName);
    await user.save();

    res.status(200).json({ message: 'City added to favorites successfully' });
  } catch (error) {
    console.error('Error adding favorite city:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// router.get('/protected-route', Verify, (req, res) => {
//   const { cognitoUserId, email } = req.user;
//   res.json({ message: `Authenticated user: ${email} (UserID: ${cognitoUserId})` });
// });




module.exports = router;
