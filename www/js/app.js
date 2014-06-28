var directionsDisplay;
var directionsService = new google.maps.DirectionsService();
var map;

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
	

			directionsDisplay = new google.maps.DirectionsRenderer();
			var zapopan = new google.maps.LatLng(20.730724, -103.447038);
			var mapOptions = {
			  zoom:7,
			  center: zapopan
			}
			
			map = new google.maps.Map(document.getElementById('map'), mapOptions);
			directionsDisplay.setMap(map);
  
			//var paint = app.getNearRoutes(20.7673,-103.41975);
			
			app.paintRoutes();

			

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
	    }
	    console.log(result);
	    return result;

	});
	
    },
    
    paintRoutes: function(routes){
	//alert(routes);
	//for (var i = 0; i < routes.length; i++) {
	    //var len = routes.route.length;
	    
	   /*  var request = {
		origin:"Sidney",
		destination:"Liverpool",
		travelMode: google.maps.TravelMode.DRIVING
	      };
	      directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
		    console.log("hola");
		    directionsDisplay.setDirections(result);
		}
	      });
	//} */
	   
	    var start = "20.67645,-103.35235";
	    var end = "20.66383,-103.33905";
	    var request = {
		origin:start,
		destination:end,
		travelMode: google.maps.TravelMode.DRIVING
	    };
	    directionsService.route(request, function(response, status) {
	      if (status == google.maps.DirectionsStatus.OK) {
		directionsDisplay.setDirections(response);
	      }
	    });
	
	
	
	
	
    },
    
    
    
}