// Replace Flash calls with fake ones for jspec testing

Flash.getFlashMovie = function(movieName) {
    return { sendMessageToFlash : function() {} };
};

Flash.sendCommand = function() {
};

jspec_sparks = {};

// Utility functions

// Extract values of a map into an array
jspec_sparks.objectValues = function (object) {
    var values = [];
    for (var key in object) {
        values.push(object[key]);
    }
    return values;
}
