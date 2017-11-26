// Declare global variables
var map;

function ViewModel() {

    var self = this;

    var markers = [];    

    // Style the default and selected icons
    var defaultIcon = makeMarkerIcon('64b764');   
    var selectedIcon = makeMarkerIcon('001');

    // Create a KO observable for user's search input
    this.searchQuery = ko.observable("");
    
    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    this.populateInfoWindow = function(marker, infowindow) {
      // Check to make sure the infowindow is not already opened on this marker.
      if (infowindow.marker != marker) {
        infowindow.marker = marker;
    
      // Construct the URL to hit Foursquare's API
      var foursquareClientID = "XTWWDRVZQ00ZEIOPQVZJO55E31ZJYY1XUEYOFEYPOWO3KCKF";
      var foursquareClientSecret = "UCE1NVC5KCYGOUURVMUNLWLIQRMIYAKHXCGJY5RIDRTZH3VS";
      var foursquareVersion = "20171124"
      var foursquareApiUrl = "https://api.foursquare.com/v2/venues/search?client_id=" +
          foursquareClientID + "&client_secret=" + foursquareClientSecret + 
          "&v=" + foursquareVersion + "&ll=" + marker.lat + "," + marker.lng;

      // JQUERY to grab a few fields, store them, and write HTML
      $.getJSON(foursquareApiUrl, function(marker) {
        var response = marker.response.venues[0];
        var street = response.location.formattedAddress[0];
        var city = response.location.formattedAddress[1];
        var category = response.categories[0].name;
        var checkinsCount = Number(response.stats.checkinsCount).toLocaleString('en');

        var foursquareHTML =
            '<p>' + category + '</p>' + '<div>' +
            '<h5> Foursquare check-ins: </h5>' + checkinsCount + '</p>' +         
            '<h5> Address: </h5>' +
            '<p>' + street + '</p>' +
            '<p>' + city + '</p>';

        // Merge the HTML of the hardcoded data and foursquare data
        infowindow.setContent(titleHTML + foursquareHTML);

      }).fail(function() {
          // If Foursquare call fails to load, show the following error alert
          alert(
            'Dang it all to heck! Foursquare failed to load. Please refresh to try again.'
          );
      });

        // HTML for the hardcoded data
        var titleHTML = '<div>' + '<h4>' + marker.title + '</h4>';  

        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick',function(){
          infowindow.setMarker = null;
          marker.setIcon(defaultIcon);            
        });
      }
    }
    
    this.selectMarker = function() {
      // If a marker is selected, deselect it.
      if (self.currentMarker) {
        self.currentMarker.setIcon(defaultIcon);
      }
      self.currentMarker = this;
      self.populateInfoWindow(this, self.largeInfowindow);
      this.setIcon(selectedIcon);      
    };

    this.initMap = function() {            
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 26.375721, lng: -80.158954},
            zoom: 13
        });

        // Infowindow object to display info about a marker
        this.largeInfowindow = new google.maps.InfoWindow();

        // Set the map bounds according to marker lat lngs
        var bounds = new google.maps.LatLngBounds();
        
        // The following group uses the location array to create an array of markers on initialize.
        for (var i = 0; i < locations.length; i++) {
          // Get the position from the location array.
          var lat = locations[i].lat;
          var lng = locations[i].lng;
          var title = locations[i].title;
          // Create a marker per location, and put into markers array.
          var marker = new google.maps.Marker({
            map: map,
            position: {
              lat: lat,
              lng: lng
            },
            lat: lat,
            lng: lng,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
          });
          // Push the marker to our array of markers.
          markers.push(marker);
          // Create an onclick event to open an infowindow at each marker.
          marker.addListener('click', self.selectMarker);
          bounds.extend(markers[i].position);
        }
        
        // Extend the boundaries of the map for each marker
        map.fitBounds(bounds);
      }

      

      // This function takes in a COLOR, and then creates a new marker
      // icon of that color. The icon will be 21 px wide by 34 high, have an origin
      // of 0, 0 and be anchored at 10, 34).
      function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
          'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
          '|40|_|%E2%80%A2',
          new google.maps.Size(21, 34),
          new google.maps.Point(0, 0),
          new google.maps.Point(10, 34),
          new google.maps.Size(21,34));
        return markerImage;
      }

    this.initMap();    

    // If search query matches a location title, display it in list and map.
    this.filteredLocations = ko.computed(function() {
      var results = [];
      for (var i = 0; i < markers.length; i++) {
          if (markers[i].title.toLowerCase().includes(this.searchQuery().toLowerCase())) {
              results.push(markers[i]);
              markers[i].setVisible(true);
          } else {
              markers[i].setVisible(false);
          }
      }
      return results;
    }, this);
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

