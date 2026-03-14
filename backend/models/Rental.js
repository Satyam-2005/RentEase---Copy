const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    startDate: Date,
    endDate: Date,
    tenure: Number,
    status: { type: String, enum: ['pending', 'approved', 'completed', 'cancelled'], default: 'pending' }
});

module.exports = mongoose.model('Rental', rentalSchema);