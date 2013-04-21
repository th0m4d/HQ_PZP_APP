$(document).ready(function () {

	var map;
	var vehicles = [];
	var currentSelection;

  var handleMessage = function(message) {
    if(message.contents.type == "unicast" && message.contents.id != webinos.session.getPZPId()) {
        //unicast message with wrong receipient id.
        return;
    }
    $('#msg_receive').append(message.contents.message + "<br><br>");
  }

  var messaging = new GRMessaging(function() {
    messaging.createChannel();
  },handleMessage);

  //log messages
  function printInfo(data) {
    $('#message').append('<li>'+data.payload.message+'</li>');
  }
  webinos.session.addListener('info', printInfo);
  
  //listener ensures, that the webinos.session object is initialized.
  webinos.session.addListener('registeredBrowser', function () {
    initOpenStreetMaps();
    findServices();
  });

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

	function noServiceCallback(serviceAddress) {
		$("#noServiceVehicles").append('<option value=' + serviceAddress + '>' + serviceAddress + '</option>');
		$('#vehicles').find('option[value=\'' + serviceAddress + '\']').remove();
	}

 	function findServices() {
		webinos.discovery.findServices(new ServiceType('http://webinos.org/api/test'), {
			onFound: function (service) {
				console.log('Found service: ' + service.serviceAddress);
				if(serviceIsFromPZP(service.serviceAddress)) {
					$('#vehicles').append($('<option value=' + service.serviceAddress + '>' + service.serviceAddress + '</option>'));						
					var vehicle = new GRVehicle(map, service.serviceAddress, noServiceCallback);
					vehicles[service.serviceAddress] = vehicle;				
				}
			}
		});
	}

	function serviceIsFromPZP(id) {
		if (id.split("/") && id.split("/").length === 2) {
			return true;		
		} else  {
			return false;		
		}
	}

	function updatePopup() {
		
		webinos.discovery.findServices(new ServiceType('http://webinos.org/api/vehicle'), {
			onFound: function (service) {
					service.bindService({onBind: function (service) {
						service.get("gear", dataHandler);
						 function dataHandler(data){
							console.log("gear is: " + data.gear);
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
		var selectedValue = $("#vehicles").find(":selected").val();
		if(selectedValue in vehicles) {
			var vehicle = vehicles[selectedValue];
			var position = vehicle.getPosition();
			map.setView([position.coords.latitude, position.coords.longitude], 13);
		}
	}

	$('#noServiceVehicles').click(function() {
		var serviceAddress = $('#noServiceVehicles').val();
		if(typeof serviceAddress === "undefined" || serviceAddress == null || serviceAddress.length == 0) {
			return;
		}
		$('#noServiceVehicles').find('option[value=\'' + serviceAddress + '\']').remove();
		vehicles[serviceAddress] = new GRVehicle(map, serviceAddress, noServiceCallback);
  });

  $('#btn_send_bc').click(function(){messaging.sendBroadcast(
    $('#msg_send').val(),
    function(success) {
      $('#msg_send').empty();
    },
    function(error) {
        alert("Could not send message: " + error.message);
    });
  });
    
  $('#btn_send_msg').click(function(){
    messaging.sendMessageTo(
      $('#vehicles').val(),
      $('#msg_send').val(),
    function(success) {
      $('#msg_send').empty();
    },
    function(error) {
        alert("Could not send message: " + error.message);
    });
  });
  $('#btn_reconnect').click(function(){connectToNextChannel();});
  jQuery("#vehicles").change(goToMarker);

});
