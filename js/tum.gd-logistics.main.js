$(document).ready(function () {

	var map;
	var vehicles = [];
	var currentSelection;

	//log messages
	function printInfo(data) {
		$('#message').append('<li>'+data.payload.message+'</li>');
	}
	webinos.session.addListener('info', printInfo);

	initOpenStreetMaps();
	findServices();

	jQuery("#serviceProviders").change(goToMarker);
			
	function initOpenStreetMaps() {
		// create a map in the "map" div, set the view to a given place and zoom
		map = L.map('map').setView([51.505, -0.09], 13);

		// add an OpenStreetMap tile layer
		L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
			  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
		}).addTo(map);

		// create a layer group for the vehicle markers		
		vehicleLayer = L.layerGroup();
    vehicleLayer.addTo(map);

	}

	function findServices() {
		webinos.discovery.findServices(new ServiceType('http://www.w3.org/ns/api-perms/geolocation'), {
			onFound: function (service) {
				$('#serviceProviders').append($('<option>' + service.serviceAddress + '</option>'));						
				var vehicle = new Vehicle(map, service);
				vehicles[service.serviceAddress] = vehicle;
				vehicle.initializeVehicle();
				vehicle.registerLocationListener();
			}
		});
	}

	function updatePopup(service, marker) {
		
		webinos.discovery.findServices(new ServiceType('http://webinos.org/api/vehicle'), {
			onFound: function (service) {
					service.bindService({onBind: function (service) {
						service.get("gear", dataHandler);
						 function dataHandler(data){
							marker.gear = data.gear;
							marker.bindPopup(marker.getVehicleInfoAsHtml());
						 }
						}
					});
			}
		});
	}

	function handleError(error) {
		switch(error.code) {
			case error.PERMISSION_DENIED: alert("user did not share geolocation data");
			break;
			case error.POSITION_UNAVAILABLE: alert("could not detect current position");
			break;
			case error.TIMEOUT: alert("retrieving position timed out");
			break;
			default: alert("unknown error code = " + error.code + "; message = " + error.message);
			break;
		}
	}

	function goToMarker() {
		var selectedValue = $("#serviceProviders").find(":selected").val();
		if(selectedValue in vehicles) {
			var vehicle = vehicles[selectedValue];
			var position = vehicle.getPosition();
			map.setView([position.coords.latitude, position.coords.longitude], 13);
//			if(typeof currentSelection !== "undefined") {
//				map.removeLayer(currentSelection);
//			}
//			currentSelection = L.circle([position.coords.latitude, position.coords.longitude], 500, {
//		    color: 'red'
//				}).addTo(map);
		}
	}

});
