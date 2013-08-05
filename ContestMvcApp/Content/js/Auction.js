var CreateListingViewModel = function () {
    var self = this;
    
    this.listTitle = ko.observable();

    this.listCategory = ko.observable();

    this.categories = ko.observableArray(['Cars', 'Animals', 'Craziness', 'People']);

    this.listOrigin = ko.observable();

    this.listDestination = ko.observable();
    
};

;(function(root) {
    var AuctionViewModel = function(bootstrapUrls, bootstrapData) {

        var self = this;

        this.urls = {
        };
        
        this.bootstrapData = bootstrapData;

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
            self.itemToList(false);
            self.listItem();
        };

        this.viewListings = function() {

        };

        this.getList = function() {
            self.getListings();
        };

        this.listings = ko.observableArray();

        /* Ajax Stuffs */

        this.listItem = function() {
            var theItem = ko.toJSON(self.listingItems);
            debugger;
            $.ajax({
                url: 'Auction/SaveItem',
                type: 'POST',
                data: theItem,
                dataType: 'json',
                contentType: 'application/json charset; utf-8'
                }).then(self.listSuccess.bind(this), self.listFailed.bind(this));
        };

        this.listSuccess = function() {
            console.log('Listing Success!!!');
        };

        this.listFailed = function() {
            console.log('Listing Failed :(');
        };
        
        this.getListings = function () {
            $.ajax({
                url: 'Auction/GetListings',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json charset; utf-8'
            }).then(self.getListingsSuccess.bind(this), self.getListingsFailed.bind(this));
        };

        this.getListingsSuccess = function (data) {
            self.listings(data);
            console.log('Get Listings Success!!!');
        };

        this.getListingsFailed = function () {
            console.log('Get Listings Failed :(');
        };

    };

    vm = new AuctionViewModel ();
})(this);

