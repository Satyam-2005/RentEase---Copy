const Rental = require('../models/Rental');

exports.createRental = async (req, res) => {
    const rental = await Rental.create(req.body);
    res.status(201).json(rental);
}

exports.getUserRentals = async (req, res) => {
    const rentals = await Rental.find({ userId: req.params.userId }).populate('product');
    res.json(rentals);
}