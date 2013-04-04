function Vehicle(map, geolocationService) {
	//public fields
	this.type = "Vehicle";
	
	//private fields
	var map = map;
	var marker;
	var geolocationService = geolocationService;
	var vehicleService;
	var watchId;
	var PositionOptions = {};
		PositionOptions.enableHighAccuracy = true;
		PositionOptions.maximumAge = 5000;
		PositionOptions.timeout = 1000;		
	var currentPosition;	

	
	//private methods

	function updatePosition(position) {
		currentPosition = position;
		console.log('Current position of ' + geolocationService.serviceAddress + ': Lat: ' + position.coords.latitude + ' Lon: ' + position.coords.longitude);
		if(typeof marker !== "undefined") {
			//update marker
			marker.setLatLng([position.coords.latitude, position.coords.longitude]);
		} else {
			//create marker		
			marker = L.vehiclemarker([position.coords.latitude, position.coords.longitude], {icon: getIcon()}, geolocationService.serviceAddress);
			marker.addTo(map);
		}	
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

	function handleErrors(error) {
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

	//public methods
	
	this.registerLocationListener = function() {
		watchId = geolocationService.watchPosition(updatePosition, handleErrors, PositionOptions);   
	}

	this.unregisterLocationListener = function() {
		geolocationService.clearWatch(watchId);
	}

	this.initializeVehicle = function() {
		// bind geolocation rpc service
		geolocationService.bindService({onBind: function (service) {
			service.getCurrentPosition(function(position) {
				updatePosition(position);
			}, function(error) {
				handleError(error);
			}, PositionOptions); // webinos rpc geolocation:
		}});      
	}

	this.getPosition = function() {
		return currentPosition;	
	}

}


