const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ Function to create directory if it doesn't exist
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// ✅ Set up dynamic storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || "uploads"; // Default to "uploads" if no category is given
    console.log("category from the upload side",category,__dirname);

    let uploadPath;
    if (category === "portfolio") {
      uploadPath = path.join(__dirname, "../uploads/portfolio");
    } else if (category === "social_activities") {
      uploadPath = path.join(__dirname, "../uploads/social_activities");
    }else if (category === "community_engagement") {
      uploadPath = path.join(__dirname, "../uploads/community_engagement");
    } else if (category === "photo_gallery") {
      uploadPath = path.join(__dirname, "../uploads/photo_gallery");
    } else if (category === "socialmedia") {
      uploadPath = path.join(__dirname, "../uploads/socialmedia");
    } else {
      uploadPath = path.join(__dirname, "../uploads");
    }

    ensureDirectoryExists(uploadPath); // ✅ Ensure folder exists
    cb(null, uploadPath);
  },
  // filename: (req, file, cb) => {
  //   cb(null, `${Date.now()}-${file.originalname}`);
  // },
  filename: (req, file, cb) => {
    const originalName = file.originalname.split('.').slice(0, -1).join('.'); // Get name without extension
    const extension = path.extname(file.originalname).toLowerCase(); // Get extension
    const timestamp = Date.now();

    // Store original file
    cb(null, `${timestamp}-${originalName}${extension}`); // Original file

    // Store converted file only if not already JPEG
    if (extension !== '.jpg' && extension !== '.jpeg') {
      cb(null, `${timestamp}-${originalName}.jpeg`); // Converted file as JPEG
    }
  },
});

// ✅ File type filter (only images & videos allowed)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|mp4|mov/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error("Only images and videos are allowed"), false);
  }
};

// ✅ Multer instance
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter,
});

module.exports = upload;
