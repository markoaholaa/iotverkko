require('dotenv').config();
const mqtt = require('mqtt');
const client = mqtt.connect(process.env.MQTT);
const axios = require('axios');

const Device = require('./db/models/device');
const Update = require('./db/models/update');
const Queue = require('./db/models/queue');
const Ban = require('./db/models/ban');

client.on('connect', function () {
	console.log('Connected to MQTT!');
	client.subscribe('pmcupdate', function (err) {
		if (!err) {
			console.log('Listening for conditions...');
		}
	});
});

client.on('message', async (topic, message) => {
	if (topic === 'pmcupdate') {
		const data = JSON.parse(message.toString());

		if (isNaN(data.humidity) || isNaN(data.temperature) || data.deviceid === null) {
			return console.log('Invalid values being sent by someone:', data.deviceid);
		}

		const deviceSecret = data.deviceid;
		const device = await Device.findOne({ deviceSecret: deviceSecret }).exec();

		const ban = await Ban.findOne({ deviceSecret: deviceSecret }).exec();

		if (ban) return;
		// TODO: Make a function that deletes expired bans.

		if (!device) {
			console.log('No match found from devices. Returning...');
			return;
		}

		console.log(data);

		// if (Math.floor(Date.now() / 1000) - device.lastPublish < 60000) {
		// 	console.log('Device with the following ID is publishing too frequently:', device.deviceid);
		// 	return;
		// }

		device.lastPublish = Math.floor(Date.now() / 1000);

		device.save();

		const city = await getCity(device.location.lon, device.location.lat);

		const update = new Update({
			temperature: data.temperature,
			humidity: data.humidity,
			city: city,
			deviceid: device.deviceid,
			location: {
				lat: device.location.lat,
				lon: device.location.lon
			}
		});

		update.save();

		const queue = new Queue({
			temperature: data.temperature,
			humidity: data.humidity,
			city: city,
			time: new Date()
		});

		queue.save();
	}
});

async function getCity(lon, lat) {
	const location = await axios.get(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?types=place&access_token=${process.env.MAPBOX}`);
	const city = location.data.features[0].text;

	if (!city) {
		return 'Unable to resolve location';
	}

	return city;
}

async function emitFromQueue() {
	const queue = await Queue.find({}).sort({ createdAt: 1 }).exec();

	if (queue.length > 0) {
		const emittable = queue[0];

		io.emit('pmcupdate', emittable);

		Queue.findOneAndDelete({ _id: emittable._id }, (err) => {
			if (err) throw err;
		});
	}

	setTimeout(emitFromQueue, 4000);
}

emitFromQueue();