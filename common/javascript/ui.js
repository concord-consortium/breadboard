(function () {
    
    this.sparks.ui = {};
    
    sparks.ui.alert = function (title, msg) {
        var e = $('<div>' + msg + '</div>').attr('title', title);
        e.dialog({ dialogClass: 'alert', modal: true });
    };
    
})();
