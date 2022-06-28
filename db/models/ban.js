const mongoose = require('mongoose');

const banSchema = new mongoose.Schema({
	deviceSecret: String,
	banDate: Date,
	expiryDate: Number
});

module.exports = new mongoose.model('Ban', banSchema);