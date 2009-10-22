// Replace Flash calls with fake ones for jspec testing

fake_flash = {};

function getFlashMovie(movieName) {
    return fake_flash;
}

function sendCommand() {
}

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
