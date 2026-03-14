const express  = require("express");
const cors     = require("cors");
const dotenv   = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin:     "https://rentease-frontend-qkr6.onrender.com",
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth",        require("./routes/authRoutes"));
app.use("/api/products",    require("./routes/productRoutes"));
app.use("/api/rentals",     require("./routes/rentalRoutes"));
app.use("/api/admin",       require("./routes/adminRoutes"));
app.use("/api/maintenance", require("./routes/maintenanceRoutes"));
app.use("/api/support",     require("./routes/supportRoutes"));
app.use("/api/admin",       require("./routes/adminOrderRoutes"));
app.use("/api/razorpay",    require("./routes/razorpayRoutes.JS"));

app.get("/", (req, res) => {
  res.status(200).json({ message: "RentEase Backend Running" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});