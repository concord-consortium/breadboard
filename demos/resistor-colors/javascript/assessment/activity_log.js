function ActivityLog()
{
    //console.log('ENTER ActivityLog');
}

ActivityLog.prototype =
{
    start_time : null,
    end_time : null,
    resistor1_section : {},
    resistor2_section : {},
    resistor3_section : {},
    
    add : function(name, value) {
        var now = new Date().valueOf();
        if (name == 'start_activity') {
            this.start_time = now; 
            this.resistor1_section.start_time = now;
        }
        else if (name == 'end_activity') {
            this.end_time = new Date().valueOf();
        }
        else {
            console.log('ERROR: add: Unknown log event name ' + name);
        }
    }
}
