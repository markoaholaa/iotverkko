const mongoose = require('mongoose');

const queueSchema = new mongoose.Schema({
	temperature: Number,
	humidity: Number,
	city: String,
	time: String
}, {
	timestamps: true
});

module.exports = new mongoose.model('Queue', queueSchema);