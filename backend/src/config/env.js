// src/config/env.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/moonnova',
  defaultReferralReward: Number(process.env.DEFAULT_REFERRAL_REWARD || 7000),
  appPrefix: process.env.APP_PREFIX || 'MOON'
};
