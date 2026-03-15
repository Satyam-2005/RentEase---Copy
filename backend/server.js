const express   = require("express");
const cors      = require("cors");
const dotenv    = require("dotenv");
const crypto    = require("crypto");
const Razorpay  = require("razorpay");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://rentease-frontend-qkr6.onrender.com",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !process.env.CLIENT_URL) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",         require("./routes/authRoutes"));
app.use("/api/products",     require("./routes/productRoutes"));
app.use("/api/rentals",      require("./routes/rentalRoutes"));
app.use("/api/admin",        require("./routes/adminRoutes"));
app.use("/api/maintenance",  require("./routes/maintenanceRoutes"));
app.use("/api/support",      require("./routes/supportRoutes"));
app.use("/api/admin-orders", require("./routes/adminOrderRoutes"));

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const razorpayRouter = express.Router();

razorpayRouter.post("/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }
    const safeReceipt = (receipt || `rcpt_${Date.now()}`)
      .toString().slice(0, 40).replace(/[^a-zA-Z0-9_-]/g, "_");
    const options = {
      amount:  Math.round(Number(amount) * 100),
      currency,
      receipt: safeReceipt,
    };
    console.log("Creating Razorpay order:", options);
    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order.id);
    res.status(200).json(order);
  } catch (err) {
    console.error("Razorpay create-order error:", err?.error || err?.message || err);
    res.status(500).json({
      error:   "Failed to create Razorpay order",
      details: err?.error?.description || err?.message || "Unknown error",
    });
  }
});

razorpayRouter.post("/verify-payment", (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing payment fields" });
    }
    const body     = razorpay_order_id + "|" + razorpay_payment_id;
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body).digest("hex");
    if (expected === razorpay_signature) {
      console.log("Payment verified:", razorpay_payment_id);
      res.status(200).json({ success: true });
    } else {
      res.status(400).json({ success: false, error: "Payment signature mismatch" });
    }
  } catch (err) {
    console.error("Razorpay verify error:", err);
    res.status(500).json({ success: false, error: "Server error during verification" });
  }
});

app.use("/api/razorpay", razorpayRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "RentEase Backend Running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
