const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
	email: String,
	auth: Number
});

module.exports = new mongoose.model('Admin', adminSchema);