const mongoose = require("mongoose");

const maintenanceSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    productName: { type: String, required: true },
    userEmail: { type: String, required: true },
    issueTitle: { type: String, required: true },
    description: { type: String, required: true },
    visitDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Archived"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Maintenance", maintenanceSchema);