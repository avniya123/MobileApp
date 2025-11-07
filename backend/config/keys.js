require("dotenv").config();

module.exports = {
  facebook: {
    pageId: process.env.FACEBOOK_PAGE_ID,
    appId: process.env.FACEBOOK_APP_ID,
    appSecret: process.env.FACEBOOK_APP_SECRET,
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    instagramId:process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
  },
  twitter: {
    apiKey: process.env.API_KEY,
    apiSecret: process.env.API_SECRET,
    accessToken: process.env.ACCESS_TOKEN,
    accessSecret: process.env.ACCESS_SECRET,
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
};
