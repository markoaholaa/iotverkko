const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
	deviceid: {
		unique: true,
		type: String,
	},
	deviceSecret: {
		unique: true,
		type: String
	},
	location: {
		lat: Number,
		lon: Number
	},
	owner: String,
	device: String,
	sensor: String,
	active: {
		type: Boolean,
		default: true
	},
	lastPublish: Number
}, {
	timestamps: true
});

module.exports = new mongoose.model('Device', deviceSchema);