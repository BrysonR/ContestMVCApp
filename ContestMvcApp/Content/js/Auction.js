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
    };

    vm = new AuctionViewModel ();
})(this);

