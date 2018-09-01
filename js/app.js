// Map
var map;
// Foursquare API Client
var clientID = "4T1C5RDAYGO1A122HFBHPSK1AS30SW5HOKXX45XWUJYZMAFS";
var clientSecret = "WY1GW42AH4UCEWDQXJFNZZMESYZOOBVYVN3PNSIZA5HJSIAK";

var ViewModel = function() {
    var self = this;

    this.filterText = ko.observable("");
    this.markers = [];

    // This function populates the infowindow when the marker is clicked. 
    // The content of information window is based on the marker.
    this.populateInfoWindow = function(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('');
            // Foursquare API URL
            var apiUrl = 'https://api.foursquare.com/v2/venues/' + marker.venue_id + 
                '?client_id=' + clientID + '&client_secret=' + clientSecret + 
                '&v=20180831';
            // Ajax request to get venue detail information
            $.getJSON(apiUrl).done(function(result) {
                var venue = result.response.venue;
                var title = venue.name;
                var street = venue.location.address;
                var city = venue.location.city;
                var zip = venue.location.postalCode;
                var state = venue.location.state;
                var country = venue.location.country;
                var category = venue.categories[0].shortName;
                var htmlContent = '<div>' + 
                    '<h4 class="info_title">' +  title + '</h4>' +
                    '<h5 class="info_category">(' + category +
                    ')</h5>' + '<div>' +
                    '<p class="info_address">' + street + '</p>' +
                    '<p class="info_address">' + city + '</p>' +
                    '<p class="info_address">' + zip + '</p>' +
                    '<p class="info_address">' + state + ', ' + country +
                    '</p>' + '</div>' + '</div>';
                infowindow.setContent(htmlContent);
            }).fail(function() {
                alert(
                    "There was an issue while requesting Foursquare API. Please try again."
                );
            });

            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    }

    this.populateInfoWindowAndHighlightMarker = function() {
        // If this.marker is defined, the functions is triggered by clicking menu.
        // When clicking the marker, 'this' means the marker itself. 
        var marker = this.marker || this;
        self.populateInfoWindow(marker, self.largeInfoWindow);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1000);
    }

    this.initMap = function() {
        // Initialize a map
        map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 36.685463, lng: 117.067215},
            zoom: 15
        });

        // Set InfoWindow
        this.largeInfoWindow = new google.maps.InfoWindow();
        locations.forEach(function(loc, i) {
            // Google Maps marker setup
            marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: loc.lat,
                    lng: loc.lng
                },
                title: loc.title,
                venue_id: loc.venue_id,
                id: i,
                animation: google.maps.Animation.DROP
            });
            marker.setMap(map);
            marker.addListener('click', self.populateInfoWindowAndHighlightMarker);
            self.markers.push(marker);
        });
    }

    this.initMap();

    // Change location list based on filter keyword
    this.shownLocations = ko.computed(function() {
        var bounds = new google.maps.LatLngBounds();
        var result = [];
        this.markers.forEach(function(marker, i) {
            if (marker.title.includes(self.filterText())) {
                marker.setMap(map);
                result.push({'title': marker.title, 'marker': marker});
                bounds.extend(marker.position);
            } else {
                marker.setMap(null);
            }
        });
        map.fitBounds(bounds);
        
        return result;
    }, this);
}

googleMapError = function () {
    alert(
        'There was an issue while loading google map. Please try again.'
    );
};

function initPage() {
    ko.applyBindings(new ViewModel());
}