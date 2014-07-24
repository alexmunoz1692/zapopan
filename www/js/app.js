var directionsService = new google.maps.DirectionsService();
var activeMap = 'nearby';
var syncingMaps = false;
var syncedMaps = 0;
var maps = {nearby: null, routes: null, places: null, actions: null};
var mapsCount = Object.keys(maps).length;
var requestArray = [];
var renderArray = [];
var routesArray = [];
var placesArray = [];
var actionsArray = [];
var colorsArray = ["#0a89ea", "#e6da0c", "#1abf47" ,"#ff4041" ,"#0d9fe7" ,"#891abe" ,"#3bfe8c", "#e66a0d"];

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
        $(document).on('deviceready', this.onDeviceReady);
			
		$(document).on('pagebeforechange', function(e, data){
			console.log(data);
		});
		
		$(document).on('pagecreate', '#page-inicio' , function(e, ui){
			$('#menu-inicio a').click(function(){
				activeMap = $(this).data('map');
			});
		});
				
		$(document).on('pagecreate', '#page-map' , function(e, ui){
			
			$('#footer-map a[data-toggle="map"]').click(function(){
				var toshow = $(this).data('map');
				var $toShow = $('#map-'+ toshow)
				$('.map:visible').not($toShow).slideUp(function(){
					$toShow.slideDown();
					activeMap = toshow;
				});
				

			});
			
			var zapopan = new google.maps.LatLng(20.730724, -103.447038);
			var mapOptions = {
			  zoom: 15,
			  minZoom: 10,
			  center: zapopan
			}
			
			//maps[map] = new google.maps.Map(document.getElementById('map-'+map), mapOptions);
			console.log('activeMap:', activeMap);
			
			$.each(maps, function(key, value){
				var $cont = $('#map-'+key);
				var map = new google.maps.Map($cont.get(0), mapOptions);
				
				google.maps.event.addListenerOnce(map, 'idle', function(){
					console.log('loaded:', map);
					if(key != activeMap){
						$cont.hide();
					}
					
					google.maps.event.addListener(map, 'idle', function() {
						if(!syncingMaps){
							app.syncMaps(map);
						}else{
							syncedMaps++;
							if(syncedMaps == mapsCount-1){
								syncedMaps = 0;
								syncingMaps = false;
								console.log('finished syncing');
							}
						}
					});
				});
								
				maps[key] = map;
			});
			
			/*app.populateRoutes( function (){
			    /*var near = app.getNear(20.7673,-103.41975, routesArray );
			    app.paintRoutes(near);
			    app.listRoutes(near);*/
			    /*
			    console.log(routesArray);
			}); */
			
			
			app.populatePlaces( function (){
			    var near = app.getNear(20.7673,-103.41975, placesArray );
			    app.markElements(near);			    

			});
			
						
			/*app.populateActions( function (){

			});*/

					  

			
			console.log(maps);
			
						

			
			//$('.map:not(:first)').hide();
			
			return;
  			

   
		});
		
    },
    
    onDeviceReady: function(){

    },
	
	syncMaps: function(toMap){
		console.log('syncing');
		syncingMaps = true;
		$.each(maps, function(key, map){
			if(map !== toMap){
				map.setCenter(toMap.getCenter());
				map.setZoom(toMap.getZoom());
			}else{
				console.log('same map');
			}
		});
		//syncingMaps = false;
	},
    
    getNear: function(lat, lng, elements){
		var result = [];
		    $.each(elements, function(key, obj) {
			for( var j = 0; j < obj.points.length ; j++){
				if (app.calculateDistance( obj.points[j].lat, obj.points[j].lng  , lat , lng) > 0.05) {
				result.push(obj);
				break;
				}  
			}
		    });
	    return result;
    },
    
    
    listRoutes: function(routes){
	
	for (var i = 0; i < routes.length; i++) {
	    	    
	    $('#panel').append(routes[i].name);
	} 
    
    },
    
   markElements: function(elements){
    
    console.log(elements);
	
	for (var i = 0; i < elements.length; i++) {
	    						
	var marker = new google.maps.Marker({
	    position: new google.maps.LatLng (elements[i].points[0].lat, elements[i].points[0].lng),
	    map: maps.nearby,
	    animation: google.maps.Animation.DROP,
	    title: elements[i].name,
	});
				
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
		
		if (requestArray){ 
		    app.processRequests();
		}
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
                renderArray[i].setMap(maps.nearby);

                // Some unique options from the colorArray so we can see the routes
                renderArray[i].setOptions({
                    preserveViewport: true,
                    suppressInfoWindows: true,
                    polylineOptions: {
                        strokeWeight: 4,
                        strokeOpacity: 0.8,
                        strokeColor: colorsArray[i]
                    },
                    markerOptions:{
                        icon:{
                            path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                            scale: 3,
                            strokeColor: colorsArray[i]
                        }
                    }
                });

                // Use this new renderer with the result
                renderArray[i].setDirections(result);
                // and start the next request
		
		nextRequest();
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
    },
    
    populateRoutes:function (callback){
	$.getJSON("js/storage/routes.json", function(data) {
	    $.each(data, function(key, val) {
		routesArray.push(val);
	    });
	    callback();
	});
    },
    
    populatePlaces:function (callback){	
	$.getJSON("js/storage/places.json", function(data) {
	    $.each(data, function(key, val) {
		placesArray.push(val);
	    });
	    callback();
	});
    },
    
    populateActions:function (callback){	
	$.getJSON("js/storage/actions.json", function(data) {
	    $.each(data, function(key, val) {
		actionsArray.push(val);
	    });
	    callback();
	});	
    }
    
}