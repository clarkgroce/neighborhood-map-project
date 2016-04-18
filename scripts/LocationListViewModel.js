function googleSuccess() {
    'use strict';

    // Represent a single location
    var Location = function (title, category, info, lat, lng) {
        var self = this;

        self.title = title;
        self.category = category;
        self.info = info;
        self.lat = lat;
        self.lng = lng;

        self.log = function() {
            console.log(self);
        };

        // Function to add this location to a given google map.
        self.addToMap = function(googleMap) {
            // Create a marker and add to the google map.
            self.marker = new google.maps.Marker({
                position: {lat: self.lat, lng: self.lng},
                map: googleMap,
                title: self.title
            });

            // Add a click listener to this marker
            google.maps.event.addListener(self.marker, 'click', function() {
                // Pan the map to the marker's position.
                self.marker.map.panTo(self.marker.position);

                // Fill the infoWindow with content and open it.                
                googleMap.infoWindow.setContent(self.info);
                googleMap.infoWindow.open(googleMap, self.marker);

                // Pan map down to allow infoWindow to be visible on mobile
                self.marker.map.panBy(0, -100);

                //Add bounce animation to marker
                self.marker.setAnimation(google.maps.Animation.BOUNCE);
                window.setTimeout(function() {
                    //Stop bounce animation
                    self.marker.setAnimation(null);
                }, 1440);
            });

            self.clicked = function() {
                // Trigger a click on the marker on google maps.
                google.maps.event.trigger(self.marker, 'click');
            };

            self.hide = function() {
                // Remove this marker from the map.
                self.marker.setMap(null);
            };

            self.show = function() {
                // Show this marker on the map.
                self.marker.setMap(googleMap);
            };
        };
    };

    // The ViewModel for the list of locations
    var LocationListViewModel = function () {
        var self = this;

        // Lat & Lng coordinates for center of map.
        var startingLat = 34.102;
        var startingLng = -84.519;

        self.mapCenter = {lat: startingLat, lng: startingLng};    
        self.map = initializeMap();

        // Observed arrays of locations and categories.
        self.locations = ko.observableArray([]);
        self.categories = ko.observableArray([]);

        // Observed search filter entered by the user.
        self.currentFilter = ko.observable();

        // Observed status for searching and showing filtered list.
        self.isSearching = ko.observable(true);
        self.shouldShowLocations = ko.observable(true);

        // If the user is searching/filtering locations, show the filtered list.
        // If the search bar loses focus, hide the list.
        self.isSearching.subscribe(function(isSearching) {
            window.setTimeout(function() {
                self.shouldShowLocations(isSearching);
            }, 200);
        });

        // Set up the google map.
        function initializeMap() {
            //Uses google global variable, If there is no internet connection, google is not defined.
            // if (typeof google === 'undefined') {
            //     document.getElementById("maperror").innerHTML = "The google map could not be loaded.";
            //     console.log("No google variable");
            //     return null;    
            // } else {
                var mapOptions = {
                    center: self.mapCenter,
                    zoom: 16,
                    //Disable Google controls/UI
                    disableDefaultUI: true
                };
                var map = new google.maps.Map(document.getElementById('map'), mapOptions);
                map.infoWindow = new google.maps.InfoWindow();
                return map;
            // }
        }
         
        // Create a unique set of categories.
        // Currently unused, but would allow for filtering by category.     
        function addCategory(name, pluralName) {

            // Check to see if this category already exists
            var match = ko.utils.arrayFirst(self.categories(), function(item) {
                return name === item.categoryName;
            });

            if (!match) {
                //Add new category
                var category = { categoryName: name, pluralName: pluralName, isSelected: true};
                self.categories.push(category);
            }
        }
        
        //Load data from foursquare
        function loadFourSquareData() {
            // Return the top interesting results from FourSquare
            var queryURL = 'https://api.foursquare.com/v2/venues/explore?ll=' +
            startingLat + ',' +
            startingLng +
            '&limit=20' +
            '&client_id=PVACF2UV50T3NPRAN10QREVQGUFATZXJ23K01UJ1GZB4T2K0&client_secret=42PTYNAYSSEO1WZDYRRIWFOVA442LHB10FPFM12BSM43ZSM5&v=20160410';

            $.getJSON(queryURL, function(data) {        
                var places = data.response.groups[0].items;
                for (var i = 0; i < places.length; i++) {
                    var location = createLocation(places[i].venue);
                    location.addToMap(self.map);
                    self.locations.push(location);
                } 
            }).fail(function() {
                console.log("Sorry, unable to complete request at the moment");
            });
        }

        // Create a new location from returned FourSquare venue location data.
        function createLocation(locationData) {
            var name = locationData.name;
            var category = locationData.categories[0].name;

            // Content for this locations infoWindow.
            var info = '<div id="info-window">'+
            '<h1 id="info-name">' + name + '</h1>'+
            '<div id=info-category">' + category + '</div>'+
            '<div id="info-body">';

             // Add an address if it is available.
            if (locationData.location && locationData.location.formattedAddress) {
                 info += '<p>' + locationData.location.formattedAddress[0] + '<br>' +
                    locationData.location.formattedAddress[1] + '<br>' +
                    locationData.location.formattedAddress[2] +
                    '</p>';
            }

             // Add a phone number if available.
            if (locationData.contact && locationData.contact.formattedPhone) {
                info += '<p>' + locationData.contact.formattedPhone + '</p>';
            }
            
            // Add open status if available.
            if (locationData.hours && locationData.hours.status) {
                info += '<p>' + locationData.hours.status + '</p>';
            }        

            info += '</div></div>';

            var lat = locationData.location.lat;
            var lng = locationData.location.lng;

            // Add this category to the unique set of categories
            addCategory(locationData.categories[0].name, locationData.categories[0].pluralName);

            return new Location(name, category, info, lat, lng);
        }

        loadFourSquareData();

        // Filter locations array based on search input
        self.filteredLocations = ko.computed(function () {
            if (!self.currentFilter()) {
                // If no filter applied, show ALL the locations on the map.
                ko.utils.arrayForEach(self.locations(), function(location) {
                    location.show();
                });
                return self.locations();
            } else {
                // Show only the filtered locations on map & hide all others.
                return ko.utils.arrayFilter(self.locations(), function(location) {
                    if (location.title.toLowerCase().indexOf(self.currentFilter().toLowerCase()) > -1) {
                        location.show();
                        return true;
                    } else {
                        location.hide();
                        return false;
                    }
                });
            }
        });

        // When a location in the list is clicked, pass that
        // click through to the location.
        self.searchResultsClicked = function(location) {
            location.clicked();
        };

        // Center and resize map when window resized
        window.addEventListener('resize', function() {
            self.map.setCenter(self.mapCenter);
            google.maps.event.trigger(map, "resize");
        });
    };

    // Bind an instance of our viewModel to the page
    var viewModel = new LocationListViewModel();
    ko.applyBindings(viewModel);
};
function googleError() {
    document.getElementById("maperror").innerHTML = "The google map could not be loaded.";
    console.log("No google variable");
    };
