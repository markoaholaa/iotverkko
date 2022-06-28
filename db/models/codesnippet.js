const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema({
	device: {
		name: String,
		urlName: String
	},
	sensor: {
		name: String,
		urlName: String
	},
	connection: {
		name: String,
		urlName: String
	},
	code: String
});

module.exports = new mongoose.model('CodeSnippet', codeSchema);