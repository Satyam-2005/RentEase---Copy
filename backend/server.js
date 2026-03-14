const express  = require("express");
const cors     = require("cors");
const dotenv   = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to Database
connectDB();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ FIX: Express 5 no longer accepts '*' — use '/{*splat}' instead
app.options("/{*splat}", cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- ROUTES ---
app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/products",     require("./routes/productRoutes"));
app.use("/api/rentals",      require("./routes/rentalRoutes"));
app.use("/api/admin",        require("./routes/adminRoutes"));
app.use("/api/maintenance",  require("./routes/maintenanceRoutes"));
app.use("/api/support",      require("./routes/supportRoutes"));
app.use("/api/admin-orders", require("./routes/adminOrderRoutes"));
app.use("/api/razorpay",     require("./routes/razorpayRoutes.js"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "RentEase Backend Running" });
});

// --- SERVER SETUP ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});