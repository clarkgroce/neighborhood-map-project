(function () {
    'use strict';

    // Represent a single location
    var Location = function (title, lat, lng) {
        this.title = title;;
        this.lat = lat;
        this.lng = lng;
    };
    // The Location List ViewModel
    var LocationListViewModel = function (locations) {
        // Array of passed in locations -- mapped to an observableArray of Location objects
       this.locations = ko.observableArray(locations.map(function (location) {
           return new Location(location.title, location.lat, location.lng);
        }));

        // Store the current search filter entered by the user
        this.currentFilter = ko.observable();

        // Filter locations array based on search input
        this.filteredLocations = ko.computed(function () {
            if (!this.currentFilter()) {
                return this.locations();
            } else {
                return ko.utils.arrayFilter(this.locations(), function(location) {
                    return location.title.indexOf(this.currentFilter()) > -1;
                }.bind(this));
            }
        }.bind(this));
        this.filter = function() {
            this.currentFilter();
        };
        //this.selectedItems = ko.observableArray(["Second"]);
 
        //this.sortItems = function() {
        //    this.items.sort();
        //}.bind(this);
    };
    // Load example data from FourSquare
    var queryURL = 'https://api.foursquare.com/v2/venues/search?near="Vancouver, BC"&oauth_token=XWDKSEKZ0FTNFJMOJ1SA5MSSA1HZVCMPTTZ5DYJUX0YFI3K4&v=20150509';

     var locations = [];
 
     $.getJSON(queryURL, function( data ) {
                 var venues = data.response.venues;
 
         for (var i = 0; i < venues.length; i++) {
            locations.push(new Location(venues[i].name, venues[i].location.lat, venues[i].location.lng));
         }

        console.log(locations);
        // Bind an instance of our viewModel to the page
        var viewModel = new LocationListViewModel(locations || []);
        ko.applyBindings(viewModel);
     });
}());