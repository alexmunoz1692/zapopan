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
		alert('aa');
        document.addEventListener('deviceready', this.onDeviceReady, false);
		
    },
    
    onDeviceReady: function(){

    },
}