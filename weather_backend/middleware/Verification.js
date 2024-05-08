const express = require('express');
const jwt = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const axios = require('axios');
const Weather = require('../models/Weather');
 // Assuming you have a User model

// Function to get Cognito's public keys
const getPublicKeys = async () => {
  try {
    const response = await axios.get('https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_d7BEerimn/.well-known/jwks.json');
    return response.data.keys;
  } catch (error) {
    console.error('Error fetching public keys:', error);
    return null;
  }
};

// Middleware to verify and decode the access token
const Verification = async (req, res, next) => {
  try {
    // Extract the access token from the Authorization header
    console.log(req.headers);
    const authorizationHeader = req.headers.authorization;
    // console.log(authorizationHeader);
    if (!authorizationHeader ||!authorizationHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const accessToken = authorizationHeader.split(' ')[1];

    // Get Cognito's public keys
    const publicKeys = await getPublicKeys();
    if (!publicKeys) {
      return res.status(500).json({ message: 'Failed to fetch public keys' });
    }

    // Find the correct key for the access token
    const tokenHeader = jwt.decode(accessToken, { complete: true }).header;
    const selectedKey = publicKeys.find(key => key.kid === tokenHeader.kid);
    if (!selectedKey) {
      return res.status(401).json({ message: 'Invalid access token' });
    }

    const pem = jwkToPem(selectedKey);

    // Verify the access token
    const decoded = jwt.verify(accessToken, pem, { algorithms: ['RS256'] });
    const { username } = decoded;

    console.log(username);
    
     let user = await Weather.findOne({ cognitoUserId: username });

    // If the user does not exist, create a new entry
    if (!user) {
      user = await Weather.create({ cognitoUserId: username });
    }
   
    // const cognitoUserId = await Weather.findOne({ cognitoUserId: username });
    // console.log(cognitoUserId);

    
    // if (!cognitoUserId) {
    //   return res.status(401).json({ message: 'User not found' });
    // }
     req.user = { cognitoUserId:user };

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = Verification;