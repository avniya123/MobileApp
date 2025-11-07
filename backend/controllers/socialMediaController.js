const fs = require("fs");
const crypto = require("crypto");
const OAuth = require("oauth-1.0a");
const axios = require("axios");
const request = require("request-promise-native");
const FormData = require("form-data");
const { v2: cloudinary } = require("cloudinary");
const keys = require("../config/keys");
const sharp = require("sharp");
const { TwitterApi, EUploadMimeType, TwitterApiV2Settings } = require('twitter-api-v2');
TwitterApiV2Settings.deprecationWarnings = false;

// Configure Cloudinary
cloudinary.config({
  cloud_name: keys.cloudinary.cloudName,
  api_key: keys.cloudinary.apiKey,
  api_secret: keys.cloudinary.apiSecret,
});

// 📌 **Upload to Cloudinary before posting to social media**
async function uploadToCloudinary(filePath) {
  try {
    console.log("in cloudinary filepath",filePath);
    const result = await cloudinary.uploader.upload(filePath);
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Failed:", error);
    throw new Error("Cloudinary Upload Failed");
  }
}

// 📌 **Upload to Facebook**
async function uploadToFacebook(filePath, message) {
  try {
    const imageUrl = await uploadToCloudinary(filePath);
    const { accessToken, pageId } = keys.facebook;

    await axios.post(
      `https://graph.facebook.com/v22.0/${pageId}/photos`,
      {
        url: imageUrl,
        message: message,
        access_token: accessToken,
      }
    );

    console.log("✅ Facebook Upload Successful");
  } catch (error) {
    console.error("❌ Facebook Upload Failed:", error.response?.data || error);
  }
}

// 📌 **Upload to Instagram**
async function uploadToInstagram(filePath, message) {
  console.log("into instagram upload")
  try {
    const imageUrl = await uploadToCloudinary(filePath);
    const { accessToken, instagramId } = keys.facebook;

    // Step 1: Create Media Container
    const mediaResponse = await axios.post(
      `https://graph.facebook.com/v22.0/${instagramId}/media`,
      {
        image_url: imageUrl,
        caption: message,
        access_token: accessToken,
      }
    );

    // Step 2: Publish Media
    await axios.post(
      `https://graph.facebook.com/v22.0/${instagramId}/media_publish`,
      {
        creation_id: mediaResponse.data.id,
        access_token: accessToken,
      }
    );

    console.log("✅ Instagram Upload Successful");
  } catch (error) {
    console.error("❌ Instagram Upload Failed:", error.response?.data || error);
  }
}

async function uploadToTwitter(filePath, message) {
  try {
    console.log("✅ Into Twitter method");

    const { apiKey, apiSecret, accessToken, accessSecret } = keys.twitter;
    console.log("🔹 Twitter API Key Loaded");

    const imageUrl = await uploadToCloudinary(filePath);
    console.log("✅ Uploaded to Cloudinary:", imageUrl);

    const imageBuffer = (await axios.get(imageUrl, { responseType: "arraybuffer" })).data;
    console.log("✅ Image downloaded");

    const twitterClient = new TwitterApi({
      appKey: apiKey,
      appSecret: apiSecret,
      accessToken,
      accessSecret,
    });

    const mediaId = await twitterClient.v1.uploadMedia(imageBuffer, {
      mimeType: EUploadMimeType.Jpeg,
    });
    console.log("✅ Media uploaded with ID:", mediaId);

    const tweet = await twitterClient.v2.tweet({
      text: message,
      media: { media_ids: [mediaId] },
    });

    console.log("✅ Tweet posted successfully:", tweet.data);

  } catch (error) {
    console.error("❌ Twitter Upload Failed:", error?.data || error.message || error);
  }
}

module.exports = { uploadToFacebook, uploadToInstagram, uploadToTwitter };
