const Device = require('./db/models/device');
const Ban = require('./db/models/ban');

io.on('connection', (socket) => {
	socket.on('activate device', async (device) => {
		const theDevice = await Device.findOne({ deviceid: device }).exec();
		theDevice.active = true;
		theDevice.lastPublish = Math.floor(Date.now() / 1000);
		theDevice.save();
		socket.emit('activate device', theDevice.deviceid);
	});

	socket.on('ban device', async (deviceSecret) => {
		const date = Math.floor(Date.now() / 1000);
		const ban = await Ban.findOne({ deviceSecret: deviceSecret }).exec();

		if (ban) {
			ban.expiryDate = date + (60 * 60 * 24 * 14);
			ban.banDate = new Date();
			ban.save();
		} else {
			const ban = new Ban({
				deviceSecret: deviceSecret,
				expiryDate: date + (60 * 60 * 24 * 14),
				banDate: new Date()
			});

			ban.save();
		}
	});
});