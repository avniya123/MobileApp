const express = require("express");
const multer = require("../middleware/multerConfig");
const sharp = require("sharp");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  uploadToFacebook,
  uploadToInstagram,
  uploadToTwitter,
} = require("../controllers/socialMediaController");

const router = express.Router();

router.post("/upload", multer.array("files[]"), async (req, res) => {
  try {
    const { postContent, platforms, category } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    let selectedPlatforms = [];
    try {
      selectedPlatforms = JSON.parse(platforms || "[]");
    } catch (error) {
      return res.status(400).json({ message: "Invalid platforms format" });
    }

    // ✅ Upload to selected platforms
    if (selectedPlatforms.length > 0) {
      for (const platform of selectedPlatforms) {
        for (const file of files) {
          let filePath = file.path;

          // ✅ Only for Twitter: Resize and compress the image
          if (platform === "x") {
            let twitterFilePath = file.path;
            const ext = path.extname(file.originalname).toLowerCase();
          
            // Only compress supported image types
            if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) {
              const tempPath = path.join(os.tmpdir(), `${Date.now()}-${file.originalname}`);
          
              try {
                const transformer = sharp(twitterFilePath).rotate();
          
                // Compress (without resize)
                if (ext === ".jpg" || ext === ".jpeg") {
                  await transformer.jpeg({ quality: 45 }).toFile(tempPath);
                } else if (ext === ".png") {
                  await transformer.png({ quality: 45 }).toFile(tempPath);
                } else if (ext === ".webp") {
                  await transformer.webp({ quality: 45 }).toFile(tempPath);
                }
          
                // Check file size
                const { size } = await fs.promises.stat(tempPath);
                if (size > 5 * 1024 * 1024) {
                  console.error("❌ Compressed file still too big for Twitter:", size);
                  return res.status(400).json({
                    message: "Compressed image still exceeds Twitter’s 5MB limit",
                    sizeInMB: (size / (1024 * 1024)).toFixed(2),
                  });
                }
          
                // Upload the compressed file
                twitterFilePath = tempPath;
              } catch (err) {
                console.error("❌ Twitter compression failed:", err);
                return res.status(500).json({ message: "Compression error for Twitter upload" });
              }
            }
          
            await uploadToTwitter(twitterFilePath, postContent);
          
            // Delete temp file
            if (twitterFilePath !== file.path) {
              try {
                await fs.promises.unlink(twitterFilePath);
              } catch (err) {
                console.warn("⚠️ Temp file cleanup failed:", err);
              }
            }
          }
          

          // ✅ Upload to platform
          try {
            if (platform === "facebook") {
              await uploadToFacebook(filePath, postContent);
            } else if (platform === "instagram") {
              await uploadToInstagram(filePath, postContent);
            } else if (platform === "x") {
              await uploadToTwitter(filePath, postContent);
            } else {
              console.warn(`Unsupported platform: ${platform}`);
            }
          } catch (uploadError) {
            console.error(`❌ Upload failed for ${platform}:`, uploadError);
          }
        }
      }
    }

    res.status(200).json({
      message:
        selectedPlatforms.length > 0
          ? "✅ Upload successful and posted to selected platforms"
          : "✅ Upload successful (only saved to site, no platforms selected)",
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
