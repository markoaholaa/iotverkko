const mongoose = require('mongoose');

const updateSchema = new mongoose.Schema({
	temperature: Number,
	humidity: Number,
	city: String,
	deviceid: String,
	location: {
		lat: Number,
		lon: Number
	},
}, {
	timestamps: true
});

module.exports = new mongoose.model('Update', updateSchema);