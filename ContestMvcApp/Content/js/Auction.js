var CreateListingViewModel = function() {
    var self = this;
    
    this.listTitle = ko.observable();

    this.listCategory = ko.observable();

    this.categories = ko.observableArray(['Cars', 'Animals', 'Craziness', 'People']);

    this.listOrigin = ko.observable();

    this.listDestination = ko.observable();
    
};

var AuctionViewModel = function (bootstrapUrls) {

    var self = this;

    this.urls = bootstrapUrls;

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

    this.viewListings = function() {

    };
};

vm = new AuctionViewModel();