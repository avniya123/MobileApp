const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const uploadRoutes = require("./routes/upload");

dotenv.config();  

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Static serving for uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/uploads/community", express.static(path.join(__dirname, "uploads/community")));
app.use("/uploads/photogallery", express.static(path.join(__dirname, "uploads/photogallery")));

// WhatsApp-related state
let latestQr = null;
let cachedGroups = [];
let isClientReady = false;

// WhatsApp client setup
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: path.join(__dirname, 'wweb_auth'),
    clientId: 'whatsapp-broadcaster'
  }),
  puppeteer: {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--single-process",
      "--disable-gpu"
    ],
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
  },
  ffmpegPath: '/usr/bin/ffmpeg'
});

// WhatsApp event listeners
client.on("qr", (qr) => {
  console.log("QR code generated");
  latestQr = qr;
  isClientReady = false;
});

client.on("authenticated", () => {
  console.log("Authentication successful");
});

client.on("auth_failure", (msg) => {
  console.error("Authentication failure:", msg);
  latestQr = null;
  isClientReady = false;
});

client.on("ready", async () => {
  console.log("Client is ready");
  isClientReady = true;
  await refreshGroups();
});

client.on("disconnected", async (reason) => {
  console.log("Client disconnected:", reason);
  isClientReady = false;
  latestQr = null;
  cachedGroups = [];
  try {
    await client.destroy();
    const authPath = path.join(__dirname, 'wweb_auth');
    if (fs.existsSync(authPath)) {
      fs.rmSync(authPath, { recursive: true, force: true });
    }
  } catch (err) {
    console.error("Cleanup error:", err);
  }
  setTimeout(() => client.initialize(), 5000);
});

const initializeClient = async () => {
  try {
    await client.initialize();
  } catch (err) {
    console.error("Initialization error:", err);
    setTimeout(initializeClient, 10000);
  }
};
initializeClient();

// WhatsApp helper functions
const refreshGroups = async () => {
  try {
    const chats = await client.getChats();
    cachedGroups = chats.filter(chat => chat.isGroup).map(chat => chat.name).sort();
  } catch (error) {
    console.error("Group refresh error:", error);
  }
};

const sendMediaWithRetry = async (chatId, media, options, retries = 3) => {
  try {
    await client.sendMessage(chatId, media, options);
    return { success: true };
  } catch (error) {
    if (retries > 0) {
      await new Promise(res => setTimeout(res, 2000));
      return sendMediaWithRetry(chatId, media, options, retries - 1);
    }
    throw error;
  }
};

// WhatsApp routes
app.get("/status", (req, res) => {
  res.json({ connected: isClientReady, qrAvailable: !!latestQr, groupsCached: cachedGroups.length > 0 });
});

app.get("/get-qr", (req, res) => {
  if (latestQr) res.json({ qr: latestQr, connected: isClientReady });
  else res.status(404).json({ error: "QR not available", connected: isClientReady });
});

app.get("/get-groups", async (req, res) => {
  if (!isClientReady) return res.status(503).json({ error: "Client not ready" });
  if (cachedGroups.length === 0) await refreshGroups();
  res.json({ groups: cachedGroups });
});

app.post("/logout", async (req, res) => {
  try {
    await client.logout();
    await client.destroy();
    const authPath = path.join(__dirname, 'wweb_auth');
    if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true });
    latestQr = null;
    isClientReady = false;
    cachedGroups = [];
    setTimeout(() => client.initialize(), 2000);
    res.json({ success: true });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ error: "Logout failed", details: err.message });
  }
});

app.post("/send-message", async (req, res) => {
  const { message, images, video, groups } = req.body;
  if (!isClientReady) return res.status(503).json({ error: "Client not ready" });
  if (!Array.isArray(groups) || groups.length === 0) return res.status(400).json({ error: "No groups selected" });
  if (!message?.trim() && (!images || images.length === 0) && !video) return res.status(400).json({ error: "No content to send" });

  try {
    const chats = await client.getChats();
    const results = [];

    for (const groupName of groups) {
      const groupResult = { group: groupName };
      const group = chats.find(chat => chat.isGroup && chat.name.toLowerCase() === groupName.toLowerCase());

      if (!group) {
        groupResult.status = "group not found";
        results.push(groupResult);
        continue;
      }

      if (video) {
        try {
          const media = new MessageMedia(video.mime || "video/mp4", video.base64, video.filename || "video.mp4");
          const options = {
            caption: message?.trim() || '',
            sendVideoAsGif: false
          };
          try {
            await sendMediaWithRetry(group.id._serialized, media, options);
            groupResult.video = "sent";
          } catch {
            await sendMediaWithRetry(group.id._serialized, media, { ...options, sendMediaAsDocument: true });
            groupResult.video = "sent as document";
          }
        } catch (err) {
          groupResult.video = "failed";
          groupResult.error = err.message;
        }
      }

      if (images?.length > 0) {
        groupResult.images = [];
        for (const image of images) {
          try {
            const media = new MessageMedia(image.mime || "image/jpeg", image.base64, image.filename || "image.jpg");
            await sendMediaWithRetry(group.id._serialized, media, {
              caption: image === images[0] ? message?.trim() : ''
            });
            groupResult.images.push({ status: "sent", filename: image.filename });
          } catch (err) {
            groupResult.images.push({ status: "failed", filename: image.filename, error: err.message });
          }
        }
      }

      if (message?.trim() && !images?.length && !video) {
        try {
          await client.sendMessage(group.id._serialized, message.trim());
          groupResult.message = "sent";
        } catch (err) {
          groupResult.message = "failed";
          groupResult.error = err.message;
        }
      }

      results.push(groupResult);
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error("Send error:", err);
    res.status(500).json({ error: "Send failed", details: err.message });
  }
});


app.get('/api/videos', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads/socialmedia_videos');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read uploads directory" });
    }

    // Filter only mp4 files and map to URLs
    const videos = files
      .filter(file => file.endsWith('.mp4'))
      .map((file, index) => ({
        id: index + 1,
        url: `/uploads/socialmedia_videos/${file}` // ✅ Correct relative URL
      }));

    res.json(videos);
  });
});


// Upload photo categories route
app.get("/api/photos/:category", (req, res) => {
  const category = req.params.category;
  const allowed = ["portfolio", "social_activities", "community_engagement", "photo_gallery", "socialmedia"];
  if (!allowed.includes(category)) return res.status(400).json({ error: "Invalid category" });

  const dir = path.join(__dirname, `uploads/${category}`);
  fs.readdir(dir, (err, files) => {
    if (err) return res.status(500).json({ error: `Failed to read ${category} directory` });
    const urls = files.map(f => `http://192.168.0.18:5000/uploads/${category}/${f}`);
    res.json(urls);
    
  });
});

// Upload routes
app.use("/api", uploadRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error", message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://192.168.0.18:${PORT}`);
  setInterval(refreshGroups, 3600000); // hourly group refresh
});
