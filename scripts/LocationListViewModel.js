(function () {
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

        self.addToMap = function(googleMap) {
            // Create a marker
            self.marker = new google.maps.Marker({
                position: {lat: self.lat, lng: self.lng},
                map: googleMap,
                title: self.title
            });

            google.maps.event.addListener(self.marker, 'click', function() {
                self.marker.map.panTo(self.marker.position);
                console.log(googleMap.infoWindow);
                console.log(self.info);
                googleMap.infoWindow.setContent(self.info);
                console.log(googleMap.infoWindow);
                googleMap.infoWindow.open(googleMap, self.marker);

                //Add bounce animation
                self.marker.setAnimation(google.maps.Animation.BOUNCE);
                window.setTimeout(function() {
                    //Stop bounce animation
                    self.marker.setAnimation(null);
                }, 1440);
            });

            self.clicked = function() {
                google.maps.event.trigger(self.marker, 'click');
            };

            self.hide = function() {
                // Remove this marker from the map
                // https://developers.google.com/maps/documentation/javascript/examples/marker-remove
                self.marker.setMap(null);
            };

            self.show = function() {
                self.marker.setMap(googleMap);
            }
        };
    };

    // The Location List ViewModel
    var LocationListViewModel = function (locationModel) {
        var self = this;

        var startingLat = 34.102;
        var startingLng = -84.519;

        self.mapCenter = {lat: startingLat, lng: startingLng};    
        self.map = initializeMap();
        self.locations = ko.observableArray([]);
        self.categories = ko.observableArray([]);

        function initializeMap() {
            //Uses google global variable, If there is no internet connection, google is not defined.
            if (typeof google === 'undefined') {
                console.log("No google variable");
                return null;    
            } else {
                var mapOptions = {
                    center: self.mapCenter,
                    zoom: 16,
                    //Disable Google controls/UI
                    disableDefaultUI: true
                };
                var map = new google.maps.Map(document.getElementById('map'), mapOptions);
                map.infoWindow = new google.maps.InfoWindow();
                return map;
            }
        }
             
        function addCategory(name, pluralName) {

            // Check to see if this category already exists
            var match = ko.utils.arrayFirst(self.categories(), function(item) {
                return name === item.categoryName;
            });

            if (!match) {
                //Add new category
                var category = { categoryNmae: name, pluralName: pluralName, isSelected: true};
                self.categories.push(category);
            }
        }
        
        //Load data from foursquare
        function loadFourSquareData() {
            // Return the top interesting results from FourSquare
            var queryURL = 'https://api.foursquare.com/v2/venues/explore?ll=' +
            startingLat + ',' +
            startingLng +
            '&limit=30' +
            '&client_id=PVACF2UV50T3NPRAN10QREVQGUFATZXJ23K01UJ1GZB4T2K0&client_secret=42PTYNAYSSEO1WZDYRRIWFOVA442LHB10FPFM12BSM43ZSM5&v=20160410';

            $.getJSON(queryURL, function(data) {
                console.log(data);         
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

        function createLocation(locationData) {
            var name = locationData.name;
            var category = locationData.categories[0].name;
            var info =  '<div id="info-window">'+
            '<h1 id="info-name">' + name + '</h1>'+
            '<div id=info-category">' + category + '</div>'+
            '<div id="info-body">';

            if (locationData.location && locationData.location.formattedAddress) {
                 info += '<p>' + locationData.location.formattedAddress[0] + '<br>' +
                    locationData.location.formattedAddress[1] + '<br>' +
                    locationData.location.formattedAddress[2] +
                    '</p>';
            }

            if (locationData.contact && locationData.contact.formattedPhone) {
                info += '<p>' + locationData.contact.formattedPhone + '</p>';
            }
            
            if (locationData.hours && locationData.hours.status) {
                info += '<p>' + locationData.hours.status + '</p>';
            }        

            info += '</div></div>';

            var lat = locationData.location.lat;
            var lng = locationData.location.lng;

            addCategory(locationData.categories[0].name, locationData.categories[0].pluralName);

            return new Location(name, category, info, lat, lng);
        }

        loadFourSquareData();

        // Store the current search filter entered by the user
        self.currentFilter = ko.observable();

        // Filter locations array based on search input
        self.filteredLocations = ko.computed(function () {
            if (!self.currentFilter()) {
                // Show all location markers on map
                ko.utils.arrayForEach(self.locations(), function(location) {
                    location.show();
                });
                return self.locations();
            } else {
                // Show filtered locations on map & hide others
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

        self.filter = function() {
            self.currentFilter();
        };

        self.searchResultsClicked = function(location) {
            console.log(location);
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

}());
