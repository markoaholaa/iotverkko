const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
	author: String,
	title: String,
	content: String,
	url: String,
	comments: [{
		author: String,
		comment: String,
		date: Date
	}]
}, {
	timestamps: true
});

module.exports = new mongoose.model('Discussion', discussionSchema);