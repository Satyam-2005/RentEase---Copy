const express = require("express");
const router = express.Router();
const Maintenance = require("../models/Maintenance");
const adminMiddleware = require("../middleware/adminMiddleware");
const { adminLogin } = require("../controllers/authController");

router.post("/login", adminLogin);

router.get("/maintenance", adminMiddleware, async (req, res) => {
  try {
    const requests = await Maintenance.find()
      .populate("product", "title")
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.get("/dashboard", adminMiddleware, (req, res) => {
  res.json({ message: "Welcome Admin Dashboard" });
});

router.put("/maintenance/:id", adminMiddleware, async (req, res) => {
  try {
    const { status, cost } = req.body;
    const request = await Maintenance.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    request.status = status || request.status;
    request.cost = cost ?? request.cost;
    if (status === "completed") request.resolvedAt = new Date();

    await request.save();
    res.json({ message: "Maintenance updated", request });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

router.delete("/maintenance/:id", adminMiddleware, async (req, res) => {
  try {
    const request = await Maintenance.findByIdAndDelete(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json({ message: "Maintenance request deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

module.exports = router;