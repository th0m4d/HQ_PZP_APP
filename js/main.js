

$(document).ready(function () {

	var geoLocationServices = [];
	var running = false;
	var map;

	var vehicleLayer;
	var vehicleMarkers = [];
	var popupContent;

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
		var key;
		for(key in geoLocationServices) {
			var service = geoLocationServices[key];
			// bind geolocation rpc service
			service.bindService({onBind: function (service) {
				// set position options			
				var PositionOptions = {};
				PositionOptions.enableHighAccuracy = true;
				PositionOptions.maximumAge = 	5000;
				PositionOptions.timeout = 1000;
				service.getCurrentPosition(function(position) {
					processMarker(service, position);
				}, function(error) {
					handleError(error);
				}, PositionOptions); // webinos rpc geolocation:
			}});      
		}
	}

	function processMarker(service, position) {

		console.log('Current position of ' + service.serviceAddress + ': Lat: ' + position.coords.latitude + ' Lon: ' + position.coords.longitude);
		var marker;
		if(service.serviceAddress in vehicleMarkers) {
			//update marker		
			marker = vehicleMarkers[service.serviceAddress];
			marker.setLatLng([position.coords.latitude, position.coords.longitude]);
		} else {
			//create marker		
			marker = L.truckmarker([position.coords.latitude, position.coords.longitude], {icon: getIcon()}, service.serviceAddress);
			//marker.on('click', onTruckClick);
			vehicleMarkers[service.serviceAddress] = marker;
			vehicleLayer.addLayer(marker);
			map.setView([position.coords.latitude, position.coords.longitude], 13);
		}	

		jQuery.when(getGear(service)).done(function(gear) {
			marker.bindPopup('Current gear: ' + gear);
		});
	}   

	function getGear(service, marker) {
		var dfd = jQuery.Deferred();	
		
		webinos.discovery.findServices(new ServiceType('http://webinos.org/api/vehicle'), {
			onFound: function (service) {
					service.bindService({onBind: function (service) {
						service.get("gear", dataHandler);
						 function dataHandler(data){
								dfd.resolve(data.gear);								
						 }
						}
					});
			}
		});
		return dfd.promise();	
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

	function onTruckClick(e) {
			alert(e);
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

});
