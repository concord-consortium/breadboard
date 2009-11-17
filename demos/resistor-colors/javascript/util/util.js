util = {}

// The "next" function returns a different value each time
// alternating between the two input values x, y.
util.Alternator = function(x, y)
{
    this.x = x;
    this.y = y;
    this.cnt = 0;
};
util.Alternator.prototype =
{
    next : function() {
        ++this.cnt;
        return this.cnt % 2 == 1 ? this.x : this.y;
    }
};

// Return a string representation of time lapsed between start and end
util.timeLapseStr = function(start, end) {
    var seconds = Math.floor((end - start) / 1000);
    var minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;
    var str = seconds + (seconds == 1 ? ' second' : ' seconds');
    if (minutes > 0) {
        str = minutes + (minutes == 1 ? ' minute ' : ' minutes ') + str
    }
    return str;
}
