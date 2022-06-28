const mongoose = require('mongoose');

const guideSchema = new mongoose.Schema({
	url: {
		type: String,
		unique: true
	},
	title: String,
	content: String,
	author: String,
	image: String,
	comments: [
		{
			commenter: String,
			comment: String,
			date: Date
		}
	]
}, {
	timestamps: true
});

module.exports = new mongoose.model('Guide', guideSchema);