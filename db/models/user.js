const mongoose = require('mongoose');
const plm = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	email: {
		type: String,
		unique: true
	},
	forgotPassword: {
		secret: {
			type: String,
			unique: true
		},
		expires: Number
	}
}, {
	timestamps: true
});

userSchema.plugin(plm, {
	errorMessages: {
		MissingPasswordError: 'Anna salasana.',
		AttemptTooSoonError: 'Tili on lukittu. Yritä myöhemmin uudelleen.',
		TooManyAttemptsError: 'Tili lukittu liian monen kirjautumisyrityksen vuoksi.',
		NoSaltValueStoredError: 'Kirjautuminen ei mahdollista.',
		IncorrectPasswordError: 'Salasana tai tunnus väärä.',
		IncorrectUsernameError: 'Salasana tai tunnus väärä.',
		MissingUsernameError: 'Anna käyttäjätunnus.',
		UserExistsError: 'Käyttäjänimellä on jo luotu tili.'
	}
});

module.exports = new mongoose.model('User', userSchema);