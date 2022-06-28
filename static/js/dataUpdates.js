function generateDiv(city, date, temperature, humidity) {
	const list = document.querySelector('.left');
	const div = document.createElement('article');
	div.classList.add('update');
	div.classList.add('update-slider');

	// Create the title
	const title = document.createElement('h3');
	const titleText = document.createTextNode(city);
	title.appendChild(titleText);

	// Add the time
	const time = document.createElement('p');
	const timeText = document.createTextNode(date);
	time.appendChild(timeText);

	// Add temp & humidity
	const data = document.createElement('p');
	const dataText = document.createTextNode(temperature + '°C' + ' / ' + humidity + '%');
	data.appendChild(dataText);

	div.appendChild(title);
	div.appendChild(time);
	div.appendChild(data);

	list.prepend(div);

	setTimeout(() => {
		div.classList.add('slide-in-from-left');
	}, 100);

	const childs = list.childElementCount;

	if (childs === 2 && document.querySelector('.waitingfordata') !== null) {
		// We received the first message. Lets remove the waiting for data text.
		list.removeChild(document.querySelector('.waitingfordata'));
	}

	if (childs > 9) {
		list.removeChild(list.lastChild);
	}
}

socket.on('pmcupdate', (msg) => {
	const date = new Date();
	const day = ('0' + date.getDate()).slice(-2);
	const month = ('0' + (date.getMonth() + 1)).slice(-2);
	const year = date.getFullYear();
	const hour = ('0' + date.getHours()).slice(-2);
	const minutes = ('0' + date.getMinutes()).slice(-2);

	const dateString = `${day}.${month}.${year} @ ${hour}:${minutes}`;

	generateDiv(msg.city, dateString, msg.temperature, msg.humidity);
});
