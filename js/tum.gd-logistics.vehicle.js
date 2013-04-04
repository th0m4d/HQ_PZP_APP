function GRVehicle(map, geolocationService) {
	//public fields
	
	//private fields
	var map = map;
	var marker;
	var popup;
	var geolocationService = geolocationService;
	var vehicleService;
	var watchId;
	var PositionOptions = {};
		PositionOptions.enableHighAccuracy = true;
		PositionOptions.maximumAge = 5000;
		PositionOptions.timeout = 1000;		
	var currentPosition;
	var vehicleData = new VehicleData();
	
	initializeVehiclePosition();
	registerLocationListener();
	initializePopupData();


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
			marker.on('click', onMarkerClick);
			popup = L.popup({offset: new L.Point(0, -15)});
		}	
		popup.setLatLng(marker.getLatLng());
	}   

	function onMarkerClick(e) {
		popup.openOn(map);	
	}

	function updatePopupData() {
		if(popup) {
			popup.setContent(getVehicleInfoAsHtml());		
		}
	}

	function 	initializeVehiclePosition() {
		// bind geolocation rpc service
		geolocationService.bindService({onBind: function (service) {
			service.getCurrentPosition(function(position) {
				updatePosition(position);
			}, function(error) {
				handleError(error);
			}, PositionOptions); // webinos rpc geolocation:
		}});      
	}

	function initializePopupData() {
		webinos.discovery.findServices(new ServiceType('http://webinos.org/api/vehicle'), {onFound: bindVehicleService});
	}

	function bindVehicleService(service) {
		if(geolocationService.serviceAddress == service.serviceAddress) {
			vehicleService = service;
			service.bindService({onBind: updateVehicleData});		
		}		
	}

	function updateVehicleData(service) {
		//register vehicle listeners after vehicle service is bound.
		registerVehicleListener();
		service.get("gear", gearDataHandler);
		service.get("tripcomputer", tripDataHandler);
		updatePopupData();
	}

	function gearDataHandler(data) {
		vehicleData.gear = data.gear;
		updatePopupData();
	}

	function tripDataHandler(data) {
		vehicleData.tripcomputer.averageConsumption = data.averageConsumption;
		vehicleData.tripcomputer.tripConsumption = data.tripConsumption;
		vehicleData.tripcomputer.averageSpeed = data.averageSpeed;
		vehicleData.tripcomputer.tripSpeed = data.tripSpeed;
		vehicleData.tripcomputer.tripDistance = data.tripDistance;
		vehicleData.tripcomputer.mileage = data.mileage;
		vehicleData.tripcomputer.range = data.range;
		updatePopupData();
	}

	
	function getVehicleInfoAsHtml() {
		return 	"<p>" + "Gear: " + vehicleData.gear + "<br/>" + 
						"Average speed: " + vehicleData.tripcomputer.averageSpeed + "<br/>" +
						"Average consumption: " + vehicleData.tripcomputer.averageConsumption + "<br/>" + "</p>";	
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

	function registerLocationListener() {
		if(geolocationService) {
			watchId = geolocationService.watchPosition(updatePosition, handleErrors, PositionOptions);  
		}
		
	}

	function registerVehicleListener() {
		if(vehicleService) {
			vehicleService.addEventListener("tripcomputer", tripDataHandler, false);   
			vehicleService.addEventListener("gear", gearDataHandler, false);   
		}
	}

	function unregisterLocationListener() {
		geolocationService.clearWatch(watchId);
	}

	function unregisterLocationListener() {
		if(vehicleService) {
			vehicleService.removeEventListener("tripcomputer", tripDataHandler, false);   
			vehicleService.removeEventListener("gear", gearDataHandler, false);   
		}
	}


	//public methods
	this.getPosition = function() {
		return currentPosition;		
	}

}


