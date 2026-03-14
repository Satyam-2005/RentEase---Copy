const express = require("express");
const router = express.Router();
const Maintenance = require("../models/Maintenance");

router.post("/", async (req, res) => {
  try {
    const { orderId, productName, userEmail, issueTitle, description, visitDate } = req.body;
    if (!orderId || !productName || !userEmail || !issueTitle || !description || !visitDate) {
      return res.status(400).json({ error: "All fields are required." });
    }
    const request = await Maintenance.create({
      orderId,
      productName,
      userEmail,
      issueTitle,
      description,
      visitDate,
      status: "Pending",
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ error: "Failed to create maintenance request." });
  }
});

router.get("/", async (req, res) => {
  try {
    const filter = { status: { $ne: "Archived" } };
    if (req.query.status) filter.status = req.query.status;
    if (req.query.userEmail) filter.userEmail = req.query.userEmail;
    const requests = await Maintenance.find(filter).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch maintenance requests." });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["Pending", "In Progress", "Resolved", "Archived"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }
    const updated = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Request not found." });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update status." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Maintenance.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete request." });
  }
});

module.exports = router;