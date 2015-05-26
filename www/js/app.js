var activeMap = 'nearby';
var syncingMaps = false;
var syncedMaps = 0;
var maps = {
	nearby: {gmap: null, markers: [], infowindow: null, directionsService: null, directionsRenderer: null, $panel: null, currentRequest: null}, 
	routes: {gmap: null, markers: [], infowindow: null, directionsService: null, directionsRenderer: null, $panel:null, currentRequest: null}, 
	places: {gmap: null, markers: [], infowindow: null, directionsService: null, directionsRenderer: null, $panel:null, currentRequest: null}, 
	actions: {gmap: null, markers: [], infowindow: null, directionsService: null, directionsRenderer: null, $panel: null, currentRequest: null}
};
var mapsCount = Object.keys(maps).length;
var geoMarker;
var $panel_container;
var requestArray = [];
var renderArray = [];
var routesArray = [];
var placesArray = [];
var actionsArray = [];


var colorsArray = ["#0a89ea", "#e6da0c", "#1abf47" ,"#ff4041" ,"#0d9fe7" ,"#891abe" ,"#3bfe8c", "#e66a0d"];
var panelTitles = {nearby: 'Cerca de mí', routes: 'Rutas', places: 'Lugares turísticos', actions: 'Trámites'};

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
			
			$panel_container = $('#panel');
			
			$panel_container.on('click', 'a', function(){
				
				var $this = $(this);
				var request = {
					origin: geoMarker.getPosition(),
					destination:new google.maps.LatLng($this.data('lat'), $this.data('lng')),
					travelMode: google.maps.TravelMode.DRIVING
				};
								
				var i = $panel_container.find('a').index($this);		  
				maps[activeMap].directionsService.route(request, function(result, status) {
					if(status == google.maps.DirectionsStatus.OK) {
					  maps[activeMap].directionsRenderer.setDirections(result);
					  google.maps.event.trigger(maps[activeMap].markers[i], 'click');
					  maps[activeMap].currentRequest = request;
					  $('#travel-mode').show();
					}
				});


				
				$panel_container.panel("close");

				maps[activeMap].gmap.setCenter(request.destination);

				return false;
			});



			$('a[data-toggle="map"]').click(function(){
				var toshow = $(this).data('map');
				var $toShow = $('#map-'+ toshow)
				$('.map:visible').not($toShow).slideUp(function(){
					$toShow.slideDown();
					activeMap = toshow;
					geoMarker.setMap(null);
					geoMarker.setMap(maps[activeMap].gmap);
					$panel_container.html(maps[activeMap].$panel);

					if( maps[activeMap].currentRequest === null){
						$('#travel-mode').hide('slow');
					} else {
						$('#travel-mode').show('slow');
					}
				});
				


			});

			$('#filter').on('click', 'a[data-toggle="map"]', function(){
				console.log("applied");
				var toshow = $(this).data('map');
				var $toShow = $('#map-'+ toshow)
				$('.map:visible').not($toShow).slideUp(function(){
					$toShow.slideDown();
					activeMap = toshow;
					geoMarker.setMap(null);
					geoMarker.setMap(maps[activeMap].gmap);
					$panel_container.html(maps[activeMap].$panel);
				});
				

			});


			$( '#filter' ).on( 'filterablebeforefilter', function ( e, data ) {


		        var $ul = $( this ),
		            $input = $( data.input ),
		            value = $input.val(),
		            html = '';

		        $ul.html( '' );
		        if ( value ) {
		            $ul.html( '<li><div class="ui-loader"><span class="ui-icon ui-icon-loading"></span></div></li>' );
		            $ul.listview( 'refresh' );

					var allPlaces = $.merge( $.merge( [], placesArray ), actionsArray );

					var placesCount = placesArray.length;

	                $.each( allPlaces, function ( i, val ) {
	                	if(val.name.toLowerCase().indexOf(value.toLowerCase()) > -1 ){

	                		var $li = $('<li>');
							var $a = $('<a href="#">')
										 .attr('data-lat', val.points[0].lat)
										 .attr('data-lng', val.points[0].lng)
										 .attr('data-toggle', 'map')
										 .attr('data-map', i > placesCount ? 'actions' : 'places')
										 .attr('data-marker', i > placesCount ? i - placesCount : i)
										 .html(val.name)
										 .append($('<p class="description">').html(val.description))
										 .append($('<p class="service-place">').html(val.place))
										 .appendTo($li);
							$li.appendTo($ul);	
	                	}
	                });



	                $ul.listview( "refresh" );
	                $ul.trigger( "updatelayout");
		        }
		    });

			$( '#travel-mode' ).on('click', 'a', function(){
				
				var $this = $(this);

				$('#travel-mode li a.active').removeClass('active');

				$this.addClass('active');

				var request = maps[activeMap].currentRequest;

				if(request){

					var travelMode = $this.data('travel-mode');

					request.travelMode = google.maps.TravelMode[travelMode];
									
					maps[activeMap].directionsService.route(request, function(result, status) {
						console.log(status);
						if(status == google.maps.DirectionsStatus.OK) {
						  maps[activeMap].directionsRenderer.setDirections(result);
						  maps[activeMap].currentRequest = request;
						}
					});
				}
				
				return false;
			});


			$( '#filter' ).on('click', 'a', function(){
				
				var $this = $(this);
				var request = {
					origin: geoMarker.getPosition(),
					destination:new google.maps.LatLng($this.data('lat'), $this.data('lng')),
					travelMode: google.maps.TravelMode.DRIVING
				};

				activeMap = $this.data('map');
								
				var i = $this.data('marker');		  
				maps[activeMap].directionsService.route(request, function(result, status) {
					console.log('status is'+ status);
					if(status == google.maps.DirectionsStatus.OK) {
					  maps[activeMap].directionsRenderer.setDirections(result);
					  google.maps.event.trigger(maps[activeMap].markers[i], 'click');
					  maps[activeMap].currentRequest = request;
					  $('#travel-mode').show();
					}
				});
				
				$('#search-bar').val('');
				$( '#filter' ).listview( "refresh" );
				return false;
			});
			
			var zapopan = new google.maps.LatLng(20.730724, -103.447038);
			var mapOptions = {
				zoom: 15,
				minZoom: 10,
				center: zapopan,

			}
			
			console.log('activeMap:', activeMap);
			
			$.each(maps, function(key, value){
				var $cont = $('#map-'+key);
				var map = new google.maps.Map($cont.get(0), mapOptions);
				
				if(key == activeMap){
					geoMarker = new GeolocationMarker(map);
				}
				
				google.maps.event.addListenerOnce(map, 'idle', function(){
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
							}
						}
					});
				});
								

				maps[key].gmap = map;
				maps[key].directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});
				maps[key].directionsRenderer.setMap(maps[key].gmap);
				maps[key].directionsService = new google.maps.DirectionsService();
			});
			
			app.populateRoutes( function (){
			    app.paintRoutes(routesArray, 'routes');
			    app.buildPanel(routesArray, 'routes');
			});
			
			
			app.populatePlaces( function (){
			    var near = app.getNear(20.7673,-103.41975, placesArray );
			    app.markElements(near, 'nearby');
				app.buildPanel(near, 'nearby');
				
				app.markElements(placesArray, 'places');
				app.buildPanel(placesArray, 'places');
			});
						
			app.populateActions( function (){
				app.markElements(actionsArray, 'actions');
				app.buildPanel(actionsArray, 'actions');
			});

					  

			
			console.log(maps);
			
						

			
			//$('.map:not(:first)').hide();
			
			return;
  			

   
		});
		
    },
    
    onDeviceReady: function(){

    },
	
	syncMaps: function(toMap){
		syncingMaps = true;
		$.each(maps, function(key, map){
			if(map.gmap !== toMap){
				map.gmap.setCenter(toMap.getCenter());
				map.gmap.setZoom(toMap.getZoom());
			}
		});
	},
    
    getNear: function(lat, lng, elements){
		var result = [];
		    $.each(elements, function(key, obj) {
			for( var j = 0; j < obj.points.length ; j++){
				if (app.calculateDistance( obj.points[j].lat, obj.points[j].lng  , lat , lng) < 5) {
					result.push(obj);
				break;
				}  
			}
		    });
	    return result;
    },
    

    
   markElements: function(elements, mapIndex){
	   $.each(elements, function(index, element){
		   var marker = new google.maps.Marker({
			   position: new google.maps.LatLng (element.points[0].lat, element.points[0].lng),
			   map: maps[mapIndex].gmap,
			   animation: mapIndex == 'nearby' ? google.maps.Animation.DROP : null,
			   title: element.name
		   });
		   
		   google.maps.event.addListener(marker, 'click', function() {
			 if (maps[mapIndex].infowindow) 
				maps[mapIndex].infowindow.close();
				
			 maps[mapIndex].infowindow = new google.maps.InfoWindow({
				content: '<strong>'+(element.place ? element.place : element.name)+'</strong>'
							+(element.address ? '<address>'+element.address+'</address>' : '')
			 });
			 
			 maps[mapIndex].infowindow.open(maps[mapIndex].gmap,marker);
		   });
		   
		   maps[mapIndex].markers.push(marker);
		   
	   });
    },
	
	buildPanel: function(elements, mapIndex){
		var $panel = $('<div id="panel-'+mapIndex+'" />');
		$panel.append('<h1 class="panel-title">'+panelTitles[mapIndex]+'</h1>');
		
		var $list = $('<ul class="list-panel '+mapIndex+'">').appendTo($panel);
		
		for (var i = 0; i < elements.length; i++) {
			var $li = $('<li>');
			var $a = $('<a href="#">')
						 .attr('data-lat', elements[i].points[0].lat)
						 .attr('data-lng', elements[i].points[0].lng)
						 .html(elements[i].name)
						 .append($('<p class="description">').html(elements[i].description))
						 .append($('<p class="service-place">').html(elements[i].place))
						 .appendTo($li);
			$li.appendTo($list);	
	   }
	   
	   var $links = $panel.find('a');
	   
	   maps[mapIndex].$panel = $panel;
	   
	   if(mapIndex == activeMap){
	       $panel_container.html($panel);
	   }
		
	},
    
    paintRoutes: function(routes, mapIndex){
	
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
		    app.processRequests(mapIndex);
		}
    },
    
    processRequests:function(mapIndex){
        // Counter to track request submission and process one at a time;
        var i = 0;

        var delay = 1;

        //  Used to submit the request 'i'
        function submitRequest(){
            maps[mapIndex].directionsService.route(requestArray[i].request, directionResults);
        }

        // Used as callback for the above request for current 'i'
        function directionResults(result, status) {

            if (status == google.maps.DirectionsStatus.OK) {
                
                // Create a unique DirectionsRenderer 'i'
                renderArray[i] = new google.maps.DirectionsRenderer({suppressMarkers: true});
                renderArray[i].setMap(maps[mapIndex].gmap);

                // Some unique options from the colorArray so we can see the routes
                renderArray[i].setOptions({
                    preserveViewport: true,
                    //suppressInfoWindows: true,
                    polylineOptions: {
                        strokeWeight: 12,
                        strokeOpacity: 0.8,
                        strokeColor: colorsArray[i]
                    },
                });

                // Use this new renderer with the result
                renderArray[i].setDirections(result);
                // and start the next request

	            var startPoint = requestArray[i].request.origin.split(",");
	            var endPoint = requestArray[i].request.destination.split(",");

	            var leg = result.routes[ 0 ].legs[ 0 ];


            var image = {
			    url: 'http://localhost/zapopan/www/img/start.png',
			    // This marker is 20 pixels wide by 32 pixels tall.
			    size: new google.maps.Size(29, 29),
	    		// The origin for this image is 0,0.
	    		origin: new google.maps.Point(0,0),
	    		// The anchor for this image is the base of the flagpole at 0,32.
	    		anchor: new google.maps.Point(14.5, 14.5)
	  		};

                markElement( maps[mapIndex].gmap, leg.start_location, "", "Test");
                markElement( maps[mapIndex].gmap, leg.end_location, image , "Test");
		

            } else if(status == google.maps.DirectionsStatus.OVER_QUERY_LIMIT){
            	console.log('over');
            	console.log(delay);
            	i--;
            	delay++;
            }

            nextRequest();

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
            setTimeout(submitRequest, delay);
        }

          function markElement (map, position, icon, title){
			var marker = new google.maps.Marker({
				position: position,
				icon: icon,
				map: map,
				title: title
			});
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
		$.getJSON("http://localhost/zapopan/www/js/storage/routes.json", function(data) {
		    $.each(data, function(key, val) {
			routesArray.push(val);
		    });
		    callback();
		});
    },
    
    populatePlaces:function (callback){	
		$.getJSON("http://localhost/zapopan/www/js/storage/places.json", function(data) {
		    $.each(data, function(key, val) {
			placesArray.push(val);
		    });
		    callback();
		});
    },
    
    populateActions:function (callback){	
		$.getJSON("http://localhost/zapopan/www/js/storage/actions.json", function(data) {
		    $.each(data, function(key, val) {
				if(actionsArray.length < 50)
					actionsArray.push(val);
		    });
		    callback();
		});	
    }
    
}