// Declare global variables
var map;

function ViewModel() {

    var self = this;

    this.initMap = function() {        
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 26.375721, lng: -80.158954},
            zoom: 12
        });
    }    

    this.initMap();    
}

// If Google maps fails to load, show the following error alert
mapsError = function() {
    alert(
        'Dang it all to heck! Google Maps failed to load. Please refresh to try again.'
    );
};

    
function startApp() {
    ko.applyBindings(new ViewModel());    
}

