var directionsService = new google.maps.DirectionsService();
var map;
var requestArray = [];
var renderArray = [];
var colourArray = ['navy', 'grey', 'fuchsia', 'black', 'white', 'lime', 'maroon', 'purple', 'aqua', 'red', 'green', 'silver', 'olive', 'blue', 'yellow', 'teal'];


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
	

			var zapopan = new google.maps.LatLng(20.730724, -103.447038);
			var mapOptions = {
			  zoom: 15,
			  center: zapopan
			}
			
			map = new google.maps.Map(document.getElementById('map'), mapOptions);
  			
			app.getNearRoutes(20.7673,-103.41975, function(result){
			    app.paintRoutes(result);
			    app.listRoutes(result);
   
			});
			
			

			

		});
		
    },
    
    onDeviceReady: function(){

    },
    
    getNearRoutes: function(lat, lng, callback){
	var result = [];

	$.getJSON("js/storage/routes.json", function(json) {
	    for(var i = 0; i < json.length; i++) {
		var obj = json[i];
		  
		for( var j = 0; j < obj.points.length ; j++){
		    if (app.calculateDistance( obj.points[j].lat, obj.points[j].lng  , lat , lng) > 0.05) {
			result.push(obj);
			break;
		    }  
		}
	    }
	    
	callback(result);
	    	    
	});
    },
    
    listRoutes: function(routes){
	
	for (var i = 0; i < routes.length; i++) {
	    	    
	    $('#panel').append(routes[i].name);
	} 
    
    },
    
    paintRoutes: function(routes){
	
	
	
	
	for (var i = 0; i < routes.length; i++) {
	    
	    
	    var len = routes[i].points.length;
	    
	    
	    var start = routes[i].points[0].lat + "," + routes[i].points[0].lng;
	    var end = routes[i].points[len - 1].lat + "," + routes[i].points[len - 1].lng;
	    var waypts = [];
	    for( var j = 1; j < len - 360 ; j++){
		
		waypts.push({
		    location: routes[i].points[j].lat + "," + routes[i].points[j].lng,
		    stopover:false});
	    }
	    
	     var request = {
		origin: start,
		destination: end,
		//waypoints: waypts,
		travelMode: google.maps.TravelMode.DRIVING
	      };
	      
	      
	    requestArray.push({"route": routes[i].name, "request": request});
	    
	         
	}
	
	app.processRequests();
    },
    
    processRequests:function(){
        // Counter to track request submission and process one at a time;
        var i = 0;

        // Used to submit the request 'i'
        function submitRequest(){
            directionsService.route(requestArray[i].request, directionResults);
        }

        // Used as callback for the above request for current 'i'
        function directionResults(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                
                // Create a unique DirectionsRenderer 'i'
                renderArray[i] = new google.maps.DirectionsRenderer();
                renderArray[i].setMap(map);

                // Some unique options from the colorArray so we can see the routes
                renderArray[i].setOptions({
                    preserveViewport: true,
                    suppressInfoWindows: true,
                    polylineOptions: {
                        strokeWeight: 4,
                        strokeOpacity: 0.8,
                        strokeColor: colourArray[i]
                    },
                    markerOptions:{
                        icon:{
                            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                            scale: 3,
                            strokeColor: colourArray[i]
                        }
                    }
                });

                // Use this new renderer with the result
                renderArray[i].setDirections(result);
                // and start the next request
                window.setTimout(nextRequest(),250000)
            }

        }

        function nextRequest(){
            // Increase the counter
            i++;
            // Make sure we are still waiting for a request
            if(i >= requestArray.length){
                // No more to do
                return;
            }
            // Submit another request
            submitRequest();
        }

        // This request is just to kick start the whole process
        submitRequest();
    },

    
    calculateDistance: function(lat1, lng1, lat2, lng2){
	var R = 6371; // Radius of the earth in km
	var dLat = (lat2 - lat1) * Math.PI / 180;  // deg2rad below
	var dLon = (lng2 - lng1) * Math.PI / 180;
	var a = 
	    0.5 - Math.cos(dLat)/2 + 
	    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
	    (1 - Math.cos(dLon))/2;

	return R * 2 * Math.asin(Math.sqrt(a));
    }
    
    
    
}