document.getElementById("route-button").addEventListener("click", handleClickMe);
getID();
document.getElementById("delete-button").addEventListener("click", handleDele)

let currentPos;

async function handleClickMe() {
	let roomName = document.getElementById("roomname").value;
	if (roomName.includes("_")) {
		let query = {
			"WHERE": {
				"IS": {
					"rooms_name": roomName
				}
			},
			"OPTIONS": {
				"COLUMNS": [
					"rooms_address"
				]
			}
		};
		let res = await fetch('/query', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(query)
		})
			.then((response) => response.json())
			.then((data) => {
				return data;
			});
		// console.log(JSON.stringify(res["result"]));
		if (JSON.stringify(res["result"]).length === 2) {
			alert("Ops, no lecture room found.");
			return;
		}
		//let address = JSON.stringify(res["result"][0]["rooms_address"]);
		let address = res["result"][0]["rooms_address"];
		const lat = currentPos.lat;
		const lng = currentPos.lng;
		document.getElementById("map").style.display = "none";
		let src = String("https://www.google.com/maps/embed/v1/directions?key=AIzaSyDUdrL66x0sAd1Vms5Wt7r2GNDoF4BLQLM" +
			"&origin=" + lat + "," + lng + "&destination=" + address);
		document.getElementById("map2").setAttribute("src", src);
		document.getElementById("map2").style.display = "inline";
	} else {
		alert("Invalid Input");
	}
}

let map, infoWindow;

function initMap() {
	map = new google.maps.Map(document.getElementById("map"), {
		center: {lat: 49.2577142, lng: -123.1941152},
		zoom: 12,
	});
	infoWindow = new google.maps.InfoWindow();

	const locationButton = document.createElement("button");

	locationButton.textContent = "Get your current location";
	locationButton.classList.add("custom-map-control-button");
	map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);
	locationButton.addEventListener("click", () => {
		// Try HTML5 geolocation.
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					currentPos = {
						lat: position.coords.latitude,
						lng: position.coords.longitude,
					};

					infoWindow.setPosition(currentPos);
					infoWindow.setContent("Location found.");
					infoWindow.open(map);
					map.setCenter(currentPos);
				},
				() => {
					handleLocationError(true, infoWindow, map.getCenter());
				}
			);
		} else {
			// Browser doesn't support Geolocation
			handleLocationError(false, infoWindow, map.getCenter());
		}
	});
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
	infoWindow.setPosition(pos);
	infoWindow.setContent(
		browserHasGeolocation
			? "Error: The Geolocation service failed."
			: "Error: Your browser doesn't support geolocation."
	);
	infoWindow.open(map);
}

function getID() {
	fetch('/datasets').then((response) => response.json())
		.then((data) => {
			return data["result"];
		})
		.then((arr) => {
			let text = "";
			arr.forEach((v) => {
				text += "<option>" + v.id + "</option>";
			});
			return text;
		}).then((t) => {
			document.getElementById("sele").innerHTML = t;
		});
}

function handleDele() {
	let val = document.getElementById("sele").value;
	fetch('/dataset/' + val, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
		}
	}).then(() => {alert("dataset: " + val + " deleted");})
}
