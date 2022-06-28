const Device = require('../db/models/device');

async function findInactive() {
	console.log('Checking inactive devices...');
	const devices = await Device.find({}).exec();
	const dateNow = Math.floor(Date.now() / 1000);

	for (i = 0; i < devices.length; i++) {
		if (dateNow - devices[i].lastPublish > 86400) {
			// Means we have not received any data from the device in a week.
			// Lets mark it as inactive
			console.log('Checking device', devices[i].deviceid);

			if (devices[i].active !== false) {
				devices[i].active = false;
				devices[i].save();
				console.log('Setting device as inactive', devices[i].deviceid);
			}
		}
	}

	setTimeout(findInactive, 1000 * 60 * 30);
}

module.exports = findInactive;