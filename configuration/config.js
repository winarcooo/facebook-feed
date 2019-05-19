const dotenv = require('dotenv');
dotenv.config();
module.exports = {
  "facebook_api_key"      : process.env.API_KEY,
  "facebook_api_secret"   : process.env.APP_SECRET,
  "callback_url"          : "http://localhost:3000/auth/facebook/callback"
}