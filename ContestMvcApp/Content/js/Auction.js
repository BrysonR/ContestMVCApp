var CreateListingViewModel = function() {
    var self = this;
    
    this.listTitle = ko.observable();

    this.listCategory = ko.observable();
};

var AuctionViewModel = function () {

    var self = this;

    this.itemToList = ko.observable(false);

    this.listingToAdd = ko.observable();

    this.createItem = function() {
        self.itemToList(true);
        self.listingToAdd(new CreateListingViewModel());
    };

    this.listingItems = ko.observableArray();

    this.saveListing = function() {
        self.listingItems.push(self.listingToAdd());
        self.listingToAdd(null);
        self.listingToAdd(false);
    };
};

vm = new AuctionViewModel();