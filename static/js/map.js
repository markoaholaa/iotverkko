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
let marker;
let markers = [];

map = L.map(bigMap, {
	center: [65.54000121937987, 25.914523241818422],
	zoom: 5,
	minZoom: 5,
	maxZoom: 18,
}).setView([65.54000121937987, 25.914523241818422]);


map.setMaxBounds(maxBounds);
map.fitBounds(maxBounds);

const latField = document.getElementById('lat');
const lonField = document.getElementById('lon');

if (latField !== null) {
	// means we are registereing a new device
	map.on('click', (e) => {
		if (typeof marker === 'object') {
			marker.setLatLng(e.latlng);
			latField.value = e.latlng.lat.toFixed(6);
			lonField.value = e.latlng.lng.toFixed(6);
		} else {
			marker = L.marker(e.latlng).addTo(map);
			latField.value = e.latlng.lat.toFixed(6);
			lonField.value = e.latlng.lng.toFixed(6);
		}
	});
}

L.tileLayer(mapUrl, {
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
	maxZoom: 18,
	tileSize: 512,
	zoomOffset: -1,
	bounds: maxBounds,
	accessToken: 'pk.eyJ1IjoibWFya29haG9sYSIsImEiOiJjbDNxZXpkNWgwYm85M2pwZm5lNm1pdm4wIn0.l4ffKeewsYuqfh9qSGs4Zg'
}).addTo(map);

if (latField === null) {
	// means we're on the front page
	fetch('/api/devices')
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

}
