
var LocationListModel = function(items) {
    this.items = ko.observableArray(items);
    this.itemToAdd = ko.observable("");

    this.addItem = function() {
        if (this.itemToAdd() != "") {
            this.items.push(this.itemToAdd());
            this.itemToAdd("");
        }
    }.bind(this);

    this.selectedItems = ko.observableArray(["Second"]);

    this.sortItmes = function() {
        this.items.sort();
    }.bind(this);
};

ko.applyBindings(new LocationListModel(["First", "Second", "Third"]));