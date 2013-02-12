var services = {};
var vehicle = null;
var bound = false;
$(document).ready(function () {
	initOpenStreetMaps();
});

function initOpenStreetMaps() {

	// create a map in the "map" div, set the view to a given place and zoom
	var map = L.map('map').setView([51.505, -0.09], 13);

	// add an OpenStreetMap tile layer
	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);

	// add a marker in the given location, attach some popup content to it and open the popup
	L.marker([51.5, -0.09]).addTo(map)
	    .bindPopup('A pretty CSS3 popup. <br> Easily customizable.')
	    .openPopup();

}

function initWebinos() {

webinos.discovery.findServices(new ServiceType('http://webinos.org/api/vehicle'), {
		onFound: function (service) {
			services[service.serviceAddress] = service;
			$('#serviceList').append($('<option>' + service.serviceAddress + '</option>'));
			console.log('SERVICEINFOs');				
			console.log(service);			
			alert(service.serviceAddress)
			if(!bound){
				vehicle = service
				vehicle.bindService(
				{
					onBind: function (service) {
					        alert('bound');
						vehicle.get('gear',function(data){alert(data.gear);})
					}
				});
			}				
		}
	});

}
