var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
    
var app = {

	// Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
			
		$(document).on('pagebeforechange', function(e, data){
			console.log(data);
		});
		
		$(document).on('pagecreate', '#page-map' , function(e, ui){
			//navigator.geolocation.getCurrentPosition(onSuccess, onError);
			/*var onSuccess = function(position) {
			    alert('Latitude: '          + position.coords.latitude          + '\n' +
				  'Longitude: '         + position.coords.longitude         + '\n' +
				  'Altitude: '          + position.coords.altitude          + '\n' +
				  'Accuracy: '          + position.coords.accuracy          + '\n' +
				  'Altitude Accuracy: ' + position.coords.altitudeAccuracy  + '\n' +
				  'Heading: '           + position.coords.heading           + '\n' +
				  'Speed: '             + position.coords.speed             + '\n' +
				  'Timestamp: '         + position.timestamp                + '\n');
			};*/
			

			var paint = app.getNearRoutes(20.7673,-103.41975);
			
			app.paintRoutes(paint);

			directionsDisplay = new google.maps.DirectionsRenderer();
			
			var mapOptions = {
			  center: new google.maps.LatLng(-34.397, 150.644),
			  zoom: 8
			};
			
			var map = new google.maps.Map(document.getElementById("map"), mapOptions);
		});
		
    },
    
    onDeviceReady: function(){

    },
    
    getNearRoutes: function(lat, lng){
	var routes = $.getJSON("js/storage/routes.json", function(json) {
	    for(var i = 0; i < json.length; i++) {
		var obj = json[i];
		var result = [];
			    
		j = 0;
			    
		routeLoop:
		while(j < obj.route.length ){
		    if (lat + .0004509 <= obj.route[j++] && obj.route[j++] <= lat - .0004509) {
			result.push(obj);
			break;
		    }
				
				
		    if (lng + .000538 <= obj.route[j++] && obj.route[j++] <= lat - .000538) {
			result.push(obj);
			break;
		    }
		}
		
		/*if (test) {
		    //code
		}*/
	    }
	    console.log(result);
	    return result;

	});
	
    },
    
    paintRoutes: function(routes){
	for (var i = 0; i < routes.length; i++) {
	    var len = routes.route.length;
	      var request = {
		origin:routes.route[0],
		destination:routes[len],
		waypoints: [
		    {
		      location:"Joplin, MO",
		      stopover:false
		    },{
		      location:"Oklahoma City, OK",
		      stopover:false
		    }],
		travelMode: google.maps.TravelMode.DRIVING
	      };
	      directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
		    directionsDisplay.setDirections(result);
		}
	      });
	}
	
    },
    
    
    
}