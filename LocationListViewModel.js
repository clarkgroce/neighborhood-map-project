(function () {
    'use strict';

    // Represent a single location
    var Location = function (title, category, lat, lng) {
        var self = this;
        self.title = title;
        self.category = category;
        self.lat = lat;
        self.lng = lng;
        self.log = function() {
            console.log(self);
        }
    };
    // The Location List ViewModel
    var LocationListViewModel = function (locationModel) {
        var self = this;

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
                center: {lat: 49.2739952, lng: -123.1403072},
                zoom: 14
            };
            var map = new google.maps.Map(document.getElementById('map'), mapOptions);

            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(49.2739952,-123.1403072),
                map: map,
                title: 'Hello World!'
            });

            var contentString = '<div id="content">'+
                '<div id="siteNotice">Site Notice'+
                '</div>'+
                '<h1 id="firstHeading" class="firstHeading">First Heading</h1>'+
                '<div id="bodyContent">'+
                '<p>body content</p>'+
                '</div>'+
                '</div>';

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(map, marker);
            });
        }

        initializeMap();

        // Load example data from FourSquare
        function loadFourSquareData() {

            //var queryURL = 'https://api.foursquare.com/v2/venues/search?near="Vancouver, BC"?client_id=VKUTCSNJXF00HDNE5ZMBMPFU0SG3MDJUXVAUOGMJQKOOCJA1&client_secret=1SDCLMDOJEYT13I4S4TRGDADKZD3XE0VL0RH32J0MELJFAKQ';
            var queryURL = 'https://api.foursquare.com/v2/venues/explore?ll=49.2739952,-123.1403072&limit=20&oauth_token=XWDKSEKZ0FTNFJMOJ1SA5MSSA1HZVCMPTTZ5DYJUX0YFI3K4&v=20150509';

            $.getJSON(queryURL, function(data) {

                var places = data.response.groups[0].items;
                for (var i = 0; i < places.length; i++) {
                    console.log(places[i].venue);
                    self.locations.push(createLocation(places[i].venue));
                }


            });
        }

        function createLocation(locationData) {
            return new Location(locationData.name, locationData.categories[0].name, locationData.location.lat, locationData.location.lng);
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

        // Bind an instance of our viewModel to the page
    var viewModel = new LocationListViewModel();
    ko.applyBindings(viewModel);
}());