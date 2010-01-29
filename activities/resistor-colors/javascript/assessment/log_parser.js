function LogParser(session) {
    this.session = session;
    this.section = session.sections[0];
    this.events = this.section.events;
    this.questions = this.section.questions;

    this.last_red_probe_conn = null;
    this.last_black_probe_conn = null;
    this.last_red_plug_conn = null;
    this.last_black_plug_conn = null;
    this.parseEvents();
}

LogParser.prototype = 
{
    parseEvents : function() {
        for (var i = 0; i < this.events.length; ++i) {
            if (this.events[i].name === 'connect') {
                this.parseConnect(this.events[i]);
            }
            else if (this.events[i].name === 'disconnect') {
                this.parseDisconnect(this.events[i]);
            }
        }
    },
    
    parseConnect : function(event) {
        var comps = event.value.split('|');
        switch (comps[0]) {
        case 'red_probe':
            this.last_red_probe_conn = comps[1];
            break;
        case 'black_probe':
            this.last_black_probe_conn = comps[1];
            break;
        case 'red_plug':
            this.last_red_plug_conn = comps[1];
            break;
        case 'black_plug':
            this.last_black_plug_conn = comps[1];
            break;
        }
    },
    
    parseDisconnect : function(event) {
    },
    
    getLastConnection : function(conn1) {
        var conn2 = null;
        var values = null;
        for (var i = 0; i < this.events.length; ++i) {
            if (this.events[i].name == 'connect') {
                values = this.events[i].value.split('|');
                if (values[0] == conn1) {
                    conn2 = values[1];
                }
            }
        }
        //console.log('conn1=' + conn1 + ' conn2=' + conn2);
        return conn2;
    },
    
    // DMM dial setting when the circuit is last made before 
    // measured resistance is submitted
    getInitialDialSetting: function() {
        var end_time = this.questions[2].end_time;
        var setting = null;
        var last_make = this.getLastCircuitMakeTime();
        if (last_make === null) {
            return null; // circuit is not connected so dial setting is meaningless
        }
        for (var i = 0; i < this.events.length && this.events[i].time < end_time; ++i) {
            if (this.events[i].name == 'multimeter_dial' && this.events[i].time <= last_make) {
                setting = this.events[i].value;
                break;
            }
        }
        return setting;
    },
    
    getFinalDialSetting: function() {
        var end_time = this.questions[2].end_time;
        var setting = null;
        var last_break = this.getLastCircuitBreakTime();
        if (last_break > -Infinity) {
            end_time = last_break;
        }
        for (var i = 0; i < this.events.length && this.events[i].time < end_time; ++i) {
            if (this.events[i].name == 'multimeter_dial') {
                setting = this.events[i].value;
            }
        }
        return setting;
    },
    
    /*
     * Last time before measured resistance is submitted that the circuit is 
     * all connected.
     * 
     * Returns +Infinity if there's no 'make_circuit' events.
     */
    getLastCircuitMakeTime : function() {
        var end_time = this.questions[2].end_time;
        var make_time = Infinity;
        for (var i = 0; i < this.events.length && this.events[i].time < end_time; ++i) {
            if (this.events[i].name === 'make_circuit') {
                make_time = this.events[i].time;
            }
        }
        return make_time;
    },
    
    getLastCircuitBreakTime : function() {
        var end_time = this.questions[2].end_time;
        var break_time = -Infinity;
        for (var i = 0; i < this.events.length && this.events[i].time < end_time; ++i) {
            if (this.events[i].name === 'break_circuit') {
                break_time = this.events[i].time;
            }
        }
        return break_time;
    }
};
