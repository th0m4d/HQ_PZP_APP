

$(document).ready(function () {

	var geoLocationServices = [];
	var serviceIndex = 0;
	var currentService = null;
	var running = false;
	var map;

	var vehicleLayer;
	var vehicleMarkers = [];

	initOpenStreetMaps();
	findServices();

	jQuery("#btnStart").click(startMonitoring);	
	jQuery("#btnStop").click(stopMonitoring);	
			
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
				geoLocationServices.push(service);
				$('#service_providers').append($('<option>' + service.serviceAddress + '</option>'));		
			}
		});
	
	}

	function startMonitoring() {

		running = true;
		monitoringLoop(1000);
	}	

	
	function monitoringLoop (timeoutInMS) {           
		 setTimeout(function () {              
		    if (running) {    
					updateLocations();	        
		    	monitoringLoop(timeoutInMS);             
		    }                        
		 }, timeoutInMS)
	}


	function stopMonitoring() {	
		running = false;	
	}

	function updateLocations() {
		updateLocationForServiceIndex(serviceIndex);
	}

	function updateLocationForServiceIndex(index) {
			currentService = geoLocationServices[index];
			getLocation(currentService);
	}

	function getLocation(geoLocationService) {
		// bind geolocation rpc service
		console.log(geoLocationService);
		geoLocationService.bindService({onBind: function (service) {
			// set position options			
			var PositionOptions = {};
			PositionOptions.enableHighAccuracy = true;
			PositionOptions.maximumAge = 	5000;
			PositionOptions.timeout = 1000;
			geoLocationService.getCurrentPosition(handle_geolocation_query, handle_errors, PositionOptions); // webinos rpc geolocation:
		}});       	
	}

	function getIcon() {
		return L.icon({
				iconUrl: 'js/leaflet/images/lorry.png',
				//shadowUrl: 'js/leaflet/images/lorry-shadow.png',
				iconSize:     [48, 48], // size of the icon
				//shadowSize:   [48, 66], // size of the shadow
				iconAnchor:   [24, 24], // point of the icon which will correspond to marker's location
				//shadowAnchor: [24, 25],  // the same for the shadow
				popupAnchor:  [-3, -30] // point from which the popup should open relative to the iconAnchor
			});	
	}

	function handle_geolocation_query(position) {

		console.log('Current position' geoLocationService);
		
		if(currentService.serviceAddress in vehicleMarkers) {
			//update marker		
			var marker = vehicleMarkers[currentService.serviceAddress];
			marker.setLatLng([position.coords.latitude, position.coords.longitude]);
		} else {
			//create marker		
			var marker = L.marker([position.coords.latitude, position.coords.longitude], {icon: getIcon()});
			vehicleMarkers[currentService.serviceAddress] = marker;
			vehicleLayer.addLayer(marker);
			map.setView([position.coords.latitude, position.coords.longitude], 13);
		}

		if(serviceIndex < geoLocationServices.length-1) {
			serviceIndex++;
			updateLocationForServiceIndex(serviceIndex);
		} else {
			serviceIndex = 0;
		}
		
	}    

	function handle_errors(error) {
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

});
