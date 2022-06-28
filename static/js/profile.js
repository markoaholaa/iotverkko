const socket = io();

const maxBounds = [
	[71.5329714169, 51.5799995065],
	[58.043732012, 2.6993827224],
];

const bigMap = document.getElementById('map');

const date = new Date();
const hour = date.getHours();

const mapUrl = (hour >= 19 && hour <= 24) ? 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png' : 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png';
let map;
let markers = [];

map = L.map(bigMap, {
	center: [65.54000121937987, 25.914523241818422],
	zoom: 5,
	minZoom: 5,
	maxZoom: 18,
}).setView([65.54000121937987, 25.914523241818422]);


map.setMaxBounds(maxBounds);
map.fitBounds(maxBounds);

L.tileLayer(mapUrl, {
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
	maxZoom: 18,
	tileSize: 512,
	zoomOffset: -1,
	bounds: maxBounds,
	accessToken: 'pk.eyJ1IjoibWFya29haG9sYSIsImEiOiJjbDNxZXpkNWgwYm85M2pwZm5lNm1pdm4wIn0.l4ffKeewsYuqfh9qSGs4Zg'
}).addTo(map);

fetch('/api/owndevices')
	.then(response =>
		response.json()
	).then(data => {
		data.forEach(device => {
			const marker = L.marker(
				{
					lat: device.lat,
					lng: device.lon
				}
			);

			marker.bindPopup(`<p>${device.device}<br>${device.sensor}</p><a href="/device/${device.id}">Avaa tiedot</a>`);

			markers.push(marker);
		});
	})
	.then(() => {
		for (i = 0; i < markers.length; i++) {
			markers[i].addTo(map);
		}
	})
	.catch(err => {
		console.log(err);
	});

const reactivateBtn = document.querySelectorAll('.device-button');

reactivateBtn.forEach(btn => {
	btn.addEventListener('click', () => {
		console.log(btn.value);
		socket.emit('activate device', btn.value);
	});
});

socket.on('activate device', (deviceid) => {
	const device = document.querySelector(`.device-${deviceid}`);
	const status = document.querySelector(`.status-${deviceid}`);
	device.classList.remove('inactive');
	status.textContent = 'Aktiivinen';
	document.querySelector('.action-button').style.display = 'none';
});