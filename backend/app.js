require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const cors = require("cors");

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const app = express();
app.set("trust proxy", 1);

const DB_PATH = process.env.MONGO_URI;

// Session store in MongoDB
const store = new MongoDBStore({ uri: DB_PATH, collection: "sessions" });
store.on("error", (err) => console.error("Session store error:", err));

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://social-sphere-full-stack.vercel.app",
  "https://social-sphere-full-stack-1l4d.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
   cookie: {
  maxAge: 1000 * 60 * 60 * 24 * 7,
  httpOnly: true,
  secure: true,
  sameSite: "none",
},
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

// Health check
app.get("/api/health", (req, res) => res.json({ status: "OK", message: "SocialSphere API running" }));

// Connect DB and start server
mongoose
  .connect(DB_PATH)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas (socialsphere)");
    const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
