function AuctionViewModel () {

    var self = this;

    this.itemToList = ko.observable(false);

    this.listTitle = ko.observable();
    this.listCategory = ko.observable();

    this.createItem = function() {
        self.itemToList(true);
    };

    this.done = function() {
        self.itemToList(false);
    };
};

vm = new AuctionViewModel();