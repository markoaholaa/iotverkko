require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGOURL, {
}, (err) => {
	if (err) return err;
	console.log('DB 1');
});

module.exports = mongoose.connection;