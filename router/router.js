const express = require('express');
const router = express.Router();
const methods = require('../methods/methods');
const passport = require('passport');
const crypto = require('crypto');
const hljs = require('highlight.js');

const User = require('../db/models/user');
const Device = require('../db/models/device');
const Update = require('../db/models/update');
const Guide = require('../db/models/guide');
const Code = require('../db/models/codesnippet');
const Forum = require('../db/models/discussion');

router.get('/', (req, res) => {
	res.render('home');
});

router.get('/login', methods.alreadySigned, (req, res) => {
	res.render('login');
});

router.get('/register', methods.alreadySigned, (req, res) => {
	res.render('signup');
});

router.get('/forgot-password', methods.alreadySigned, (req, res) => {
	res.render('forgot-password');
});

router.get('/new-device', methods.ensureAuth, (req, res) => {
	res.render('register');
});

router.get('/profile', methods.ensureAuth, async (req, res) => {
	const devices = await Device.find({ owner: req.user.username }).exec();

	res.render('profile', {
		devices: devices
	});
});

router.get('/guides', async (req, res) => {
	const guides = await Guide.find({}).exec();

	res.render('guides', {
		guides: guides
	});
});


router.get('/guides/:guide', async (req, res) => {
	const url = '/guides/' + req.params.guide;
	const guide = await Guide.findOne({ url: url }).exec();

	console.log(guide);

	res.render('guide', {
		guide: guide
	});
});

router.get('/devices', async (req, res) => {
	const devices = await Device.find({}).exec();

	res.render('devices', {
		devices: devices
	});
});

router.get('/examples', async (req, res) => {

	const codes = await Code.find({}).exec();

	const devices = [];
	const sensors = [];
	const connections = [];

	for (i = 0; i < codes.length; i++) {
		const deviceObject = {
			name: codes[i].device.name,
			urlName: codes[i].device.urlName
		};

		const sensorObject = {
			name: codes[i].sensor.name,
			urlName: codes[i].sensor.urlName
		};

		const connectionObject = {
			name: codes[i].connection.name,
			urlName: codes[i].connection.urlName
		};

		if (devices.length === 0 || devices.some(device => device.name !== deviceObject.name)) {
			devices.push(deviceObject);
		}

		if (sensors.length === 0 || sensors.some(sensor => sensor.name !== sensorObject.name)) {
			sensors.push(sensorObject);
		}

		if (connections.length === 0 || connections.some(connection => connection.name !== connectionObject.name)) {
			connections.push(connectionObject);
		}
	}

	console.log(sensors);

	res.render('examples', {
		exampleCode: '',
		devices: devices,
		sensors: sensors,
		connections: connections
	});
});

router.get('/findCode/:device?/:sensor?/:connection?', async (req, res) => {

	const codes = await Code.find({}).exec();

	const devices = [];
	const sensors = [];
	const connections = [];

	for (i = 0; i < codes.length; i++) {
		const deviceObject = {
			name: codes[i].device.name,
			urlName: codes[i].device.urlName
		};

		const sensorObject = {
			name: codes[i].sensor.name,
			urlName: codes[i].sensor.urlName
		};

		const connectionObject = {
			name: codes[i].connection.name,
			urlName: codes[i].connection.urlName
		};

		if (devices.length === 0 || devices.some(device => device.name !== deviceObject.name)) {
			devices.push(deviceObject);
		}

		if (sensors.length === 0 || sensors.some(sensor => sensor.name !== sensorObject.name)) {
			sensors.push(sensorObject);
		}

		if (connections.length === 0 || connections.some(connection => connection.name !== connectionObject.name)) {
			connections.push(connectionObject);
		}
	}

	const examples = await Code.findOne({
		'device.urlName': req.query.device,
		'sensor.urlName': req.query.sensor,
		'connection.urlName': req.query.connection
	}).exec();

	if (!examples) {
		req.flash('error', 'Esimerkkikoodia ei löytynyt');
		return res.redirect('/examples');
	}

	res.render('examples', {
		exampleCode: examples.code,
		devices: devices,
		sensors: sensors,
		connections: connections
	});
});

router.get('/3dprint', (req, res) => {
	res.render('3dprint');
});

router.get('/discussion', methods.ensureAuth, async (req, res) => {
	const threads = await Forum.find({}).sort({ createdAt: -1 }).exec();

	res.render('discussion', {
		threads: threads,
		currentThread: undefined
	});
});

router.get('/discussion/new', methods.ensureAuth, async (req, res) => {
	res.render('discussion-new');
});

router.get('/discussion/:discussion', methods.ensureAuth, async (req, res) => {
	const threads = await Forum.find({}).sort({ createdAt: -1 }).exec();
	const discussion = await Forum.findOne({ url: req.params.discussion }).exec();

	if (!discussion) {
		req.flash('error', 'Emme löytäneet viestiketjua.');
		return res.redirect('/discussion');
	}

	res.render('discussion', {
		threads: threads,
		currentThread: discussion
	});
});

router.get('/admin', methods.ensureAdmin, async (req, res) => {
	const devices = await Device.find({}).exec();
	const users = await User.find({}).exec();

	res.render('admin', {
		devices: devices,
		users: users
	});
});

router.get('/device/:deviceid', methods.ensureAuth, async (req, res) => {
	const device = await Device.findOne({ deviceid: req.params.deviceid }).exec();

	const updatesCount = await Update.count().exec();
	const skip = updatesCount - 21;

	const updates = await Update.find({ deviceid: req.params.deviceid }).skip(skip).sort({ createdAt: 1 }).exec();

	if (!device) {
		req.flash('error', 'Laitetta ei löytynyt.');
		return res.redirect('/');
	}

	res.render('device', {
		device: device,
		updates: updates
	});
});

router.get('/logout', function (req, res) {
	req.logout((err => {
		if (err) throw err;
	}));
	res.redirect('/');
});

// API

router.get('/api/devices', async (req, res) => {
	const devices = await Device.find({ active: true }).exec();
	const response = [];

	for (i = 0; i < devices.length; i++) {
		const data = {
			device: devices[i].device,
			id: devices[i].deviceid,
			sensor: devices[i].sensor,
			lat: devices[i].location.lat,
			lon: devices[i].location.lon
		};

		response.push(data);
	}

	res.json(response);
});

router.get('/api/owndevices', async (req, res) => {
	const user = req.user;

	const devices = await Device.find({ owner: user.username }).exec();
	const response = [];

	for (i = 0; i < devices.length; i++) {
		const data = {
			device: devices[i].device,
			id: devices[i].deviceid,
			sensor: devices[i].sensor,
			lat: devices[i].location.lat,
			lon: devices[i].location.lon
		};

		response.push(data);
	}

	res.json(response);
});

// END API

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), function (req, res) {
	res.redirect('/');
});

router.post('/register', function (req, res, next) {
	User.register(new User({ username: req.body.username, email: req.body.email }), req.body.password, function (err) {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('/register');
		}

		console.log('user registered!');
		req.flash('message', 'Rekisteröinti onnistui!');
		res.redirect('/');
	});
});

router.post('/forgot-password', methods.alreadySigned, async (req, res) => {
	const email = req.body.email;

	const user = await User.findOne({ email: email }).exec();

	if (!user) {
		req.flash('message', 'Ohjeet lähetetty sähköpostitse.');
		return res.redirect('/forgot-password');
	}

	const secret = crypto.randomBytes(12).toString('hex');

	user.forgotPassword.secret = secret;
	user.forgotPassword.expires = Math.floor(Date.now() / 1000) + 86400;

	user.save((err) => {
		if (!err) {
			// We also need to actually send the email here.
			req.flash('message', 'Ohjeet lähetetty sähköpostitse.');
			return res.redirect('/forgot-password');
		}

		req.flash('error', 'Tapahtui virhe. Yritä uudelleen.');
		res.redirect('/forgot-password');
	});
});

router.post('/register-device', methods.ensureAuth, async (req, res) => {
	const id = crypto.randomBytes(6).toString('hex');
	const deviceSecret = crypto.randomBytes(8).toString('hex');

	const device = new Device({
		deviceid: id,
		deviceSecret: deviceSecret,
		location: {
			lat: req.body.lat,
			lon: req.body.lon
		},
		owner: req.user.username,
		device: req.body.device,
		sensor: req.body.sensor
	});

	device.save((err) => {
		if (err) {
			req.flash('error', 'Jotain meni pieleen.');
			return res.redirect('/new-device');
		}

		req.flash('message', 'Laite lisätty!');
		res.redirect('/');
	});
});

// Discussions

router.post('/newThread', methods.ensureAuth, (req, res) => {
	const thread = new Forum({
		author: req.user.username,
		title: req.body.title,
		content: req.body.content,
		url: req.body.title
			.trim()
			.replaceAll(' ', '-')
			.replaceAll('Ä', 'A')
			.replaceAll('ä', 'a')
			.replaceAll('Ö', 'O')
			.replaceAll('ö', 'o')
			.toLowerCase() + '-' + Math.floor(Date.now() / 1000)
	});

	thread.save((err) => {
		if (!err) {
			req.flash('message', 'Viesti julkaistu.');
			res.redirect('/discussion');
		}
	});
});

router.post('/commentThread', methods.ensureAuth, async (req, res) => {
	const thread = await Forum.findOne({ _id: req.body.id }).exec();

	if (req.body.comment.length < 1) {
		req.flash('error', 'Anna kommenttiisi sisältöä.');
		return res.redirect('/discussion/' + thread.url);
	}

	thread.comments.push({
		author: req.user.username,
		comment: req.body.comment,
		date: new Date()
	});

	thread.save((err) => {
		if (!err) {
			res.redirect('/discussion/' + thread.url);
		}
	});
});

// Admin POST Routes
router.post('/newGuide', methods.ensureAdmin, (req, res) => {
	let image;
	let uploadPath;

	if (req.files) {
		image = req.files.image;
		let fileName = image.name;

		if (fileName.contains('logo')) {
			fileName = '0x19' + image.name;
		}

		uploadPath = 'static/img/' + image.name;

		image.mv(uploadPath, function (err) {
			if (err) return res.status(500).send(err);
		});
	} else {
		uploadPath = '';
		console.log('No image...');
	}

	const url = '/guides/' + req.body.title.replaceAll(' ', '-').replaceAll('ä', 'a').replaceAll('ö', 'o').toLowerCase();

	const guide = new Guide({
		url: url,
		title: req.body.title,
		content: req.body.content,
		author: req.user.username,
		image: uploadPath
	});

	guide.save((err) => {
		if (!err) {
			req.flash('message', 'Ohje tallennettu!');
			res.redirect('/admin');
		}
	});
});

router.post('/newCodeSnippet', methods.ensureAdmin, (req, res) => {
	const cCode = hljs.highlightAuto(req.body.code).value;

	const code = new Code({
		device: {
			name: req.body.device,
			urlName: trim(req.body.device)
		},
		sensor: {
			name: req.body.sensor,
			urlName: trim(req.body.sensor)
		},
		connection: {
			name: req.body.connection,
			urlName: trim(req.body.connection)
		},
		code: cCode
	});

	code.save((err) => {
		if (err) throw err;
		req.flash('message', 'Koodi tallennettu.');
		res.redirect('/admin');
	});
});

function trim(string) {
	return string.replaceAll(' ', '').toLowerCase();
}

module.exports = router;