const Maintenance = require("../models/Maintenance");

/* ===============================
   USER - Create Request
================================ */
exports.createRequest = async (req, res) => {
  try {
    const { productId, issueTitle, description } = req.body;

    const request = await Maintenance.create({
      user: req.user.id,
      product: productId,
      issueTitle,
      description,
    });

    res.status(201).json({
      message: "Maintenance request submitted",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating request" });
  }
};

/* ===============================
   ADMIN - Get All Requests
================================ */
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Maintenance.find()
      .populate("user", "name email")
      .populate("product", "name");

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};

/* ===============================
   ADMIN - Update Status
================================ */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const request = await Maintenance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json({
      message: "Status updated",
      request,
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating status" });
  }
};