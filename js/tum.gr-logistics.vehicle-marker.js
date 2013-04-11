L.VehicleMarker = L.Marker.extend({
	
	gear: "-",
	tripcomputer: "-",
	parksensorsfront: "-",
	parksensorsrear: "-",
	engineoil: "-",
	wipers: "-",
	tirepressure: "-",
	doors: "-",
	windows: "-",
	climateall: "-",
	climatedriver: "-",
	climatebehinddriver: "-",
	climatepassenger: "-",
	climatebehindpassenger: "-",
	lightfogfront: "-",
	lightfogrear: "-",
	lightsignalleft: "-",
	ligthsignalright: "-",
	lightsignalwarn: "-",
	lightparking: "-",
	lighthibeam: "-",
	lighthead: "-",
	seatdriver: "-",
	seatpassenger: "-",
	seatbehinddriver: "-",
	seatbehindpassenger: "-",

	initialize: function (latlng, options, serviceAddr) {
		L.Marker.prototype.initialize.call(this, latlng, options);
		this.serviceAddress = serviceAddr;
	},
	
	getServiceAddress: function () {
		return this.serviceAddress;
	},

	getVehicleInfoAsHtml: function () {
		return 	"<p>" + "Gear: " + this.gear + "<br/>" + 
						"Tripcomputer: " + this.tripcomputer + "<br/>" +
						"Engineoil: " + this.engineoil + "<br/>" +
						"Wipers: " + this.wipers + "<br/>" +
						"Tirepressure: " + this.tirepressure + "<br/>" + 
						"Doors: " + this.doors + "<br/>" +
						"Windows: " + this.windows + "<br/>" + 
						"Climate all: " + this.climateall + "<br/>" + 
						"Headlights: " + this.headlight + "<br/>" + "</p>";	
	},

	toString: function () {
		var s = [];
    for (var k in this) {
        if (this.hasOwnProperty(k)) s.push(k + ':' + this[k]);
    }
    return '{' + s.join() + '}';
	}

});

L.vehiclemarker = function (latlng, options, serviceAddress) {
	return new L.VehicleMarker(latlng, options, serviceAddress);
};
