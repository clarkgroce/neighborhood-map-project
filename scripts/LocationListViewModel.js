
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
        }

        self.addToMap = function(googleMap) {
            //marker creation
            self.marker = new google.maps.Marker({
                position: new google.maps.LatLng(self.lat,self.lng),
                map: googleMap,
                title: self.title
            });

            var InfoWindow = new google.maps.InfoWindow({ content: self.info});

            google.maps.event.addListener(self.marker, 'click', function() {
                infowindow.open(googleMap, self.marker);
            });
        }
    };


    // The Location List ViewModel
    var LocationListViewModel = function (locationModel) {
        var self = this;

        self.map = initializeMap();

        // Observable Array of Locations
        self.locations = ko.observableArray([]);

        // Location Categories
        self.categories = [
            { categoryName: "Coffee Shops" },
            { categoryName: "Restaurants" },
            { categoryName: "Book Stores" },
            { categoryName: "Parks" }
        ];

        self.selectedCategories = [
            { categoryName: "Coffee Shops", isSelected: false },
            { categoryName: "Restaurants", isSelected: false },
            { categoryName: "Book Stores", isSelected: false },
            { categoryName: "Parks", isSelected: false }
        ];

        function initializeMap() {
            var mapOptions = {
                center: {lat: 34.102803, lng: -84.516853},
                zoom: 15
            };
            return new google.maps.Map(document.getElementById('map'), mapOptions);
        }

        // Load example data from FourSquare
        function loadFourSquareData() {

            var queryURL = 'https://api.foursquare.com/v2/venues/explore?ll=34.102803,-84.516853&client_id=PVACF2UV50T3NPRAN10QREVQGUFATZXJ23K01UJ1GZB4T2K0&client_secret=42PTYNAYSSEO1WZDYRRIWFOVA442LHB10FPFM12BSM43ZSM5&v=20160410';

            $.getJSON(queryURL, function(data) {

                var places = data.response.groups[0].items;
                for (var i = 0; i < places.length; i++) {
                    console.log(places[i].venue);
                    var location = createLocation(places[i].venue);
                    console.log(location);
                    location.addToMap(self.map);
                    self.locations.push(location);
                }

            });
        }

        function createLocation(locationData) {
            var name = locationData.name;
            var category = locationData.categories[0].name;
            var info = '<div id="content">'+
                '<div id="siteNotice">'+category+
                '</div>'+
                '<h1 id="firstHeading" class="firstHeading">' + name + '</h1>'+
                '<div id="bodyContent">'+
                '<p>other stuff</p>'+
                '</div>'+
                '</div>';
            var lat = locationData.location.lat;
            var lng = locationData.location.lng;

            return new Location(name, category, info, lat, lng);
        }

        loadFourSquareData();

        // Array of passed in locations -- mapped to an observableArray of Location objects
        //self.locations = ko.observableArray(locationModel.locations.map(function (location) {
        //    return new Location(location.title, location.lat, location.lng);
        //}));

        console.log("Mapped locations: " + self.locations());

        // Store the current search filter entered by the user
        self.currentFilter = ko.observable();

        // Filter locations array based on search input
        self.filteredLocations = ko.computed(function () {
            if (!self.currentFilter()) {
                return self.locations();
            } else {
                return ko.utils.arrayFilter(self.locations(), function(location) {
                    return location.title.indexOf(self.currentFilter()) > -1;
                });
            }
        });

        self.filter = function() {
            self.currentFilter();
        };

        // Console Log the JSON form of the ViewModel
        //console.log(ko.toJSON(self));



    };






    // Bind an instance of our viewModel to the page
    var viewModel = new LocationListViewModel();
    ko.applyBindings(viewModel);
}());
