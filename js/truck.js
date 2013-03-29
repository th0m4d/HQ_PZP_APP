L.TruckMarker = L.Marker.extend({
	
	initialize: function (latlng, options, serviceAddr) {
		L.Marker.prototype.initialize.call(this, latlng, options);
		this.serviceAddress = serviceAddr;
	},
	
	getServiceAddress: function () {
		return this.serviceAddress;
	},

});

L.truckmarker = function (latlng, options, serviceAddress) {
	return new L.TruckMarker(latlng, options, serviceAddress);
};
