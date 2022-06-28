const passport = require('passport');

const Admin = require('../db/models/admin');

module.exports.ensureAuth = function (req, res, next) {
	if (!req.isAuthenticated()) {
		req.flash('error', 'Sinun on ensin kirjauduttava sisään.');
		return res.redirect('/login');
	}

	next();
};

module.exports.alreadySigned = function (req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}

	req.flash('message', 'Olet jo kirjautunut.');
	res.redirect('/');
};

module.exports.ensureAdmin = async function (req, res, next) {
	if (!req.isAuthenticated()) {
		return res.redirect('/login');
	}

	const admin = await Admin.findOne({ email: req.user.email }).exec();

	if (!admin) {
		req.flash('error', 'Ei pääsyä.');
		return res.redirect('/');
	}

	next();
};