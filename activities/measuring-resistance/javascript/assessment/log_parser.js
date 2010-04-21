function LogParser(session) {
    this.session = session;
    this.section = session.sections[0];
    this.events = this.section.events;
    this.questions = this.section.questions;
    
    this.measure_submit_time = this.questions[2].end_time;

    this.submit_red_probe_conn = null;
    this.submit_black_probe_conn = null;
    this.submit_red_plug_conn = null;
    this.submit_black_plug_conn = null;
    this.initial_dial_setting = 'acv_750'; //DMM dial setting when the swith is first turned on
    this.submit_dial_setting = 'acv_750'; //DMM dial setting when the user submits the 3rd question
    this.power_on = false; //Power switch when the user submits the 3rd question
    this.correct_order = false;
    
    // The following variables prefixed with temp_ are meant to be used
    // by parseEvents(), updated as it scans the list of events
    this.temp_power_on = false;
    this.temp_red_probe_conn = null;
    this.temp_black_probe_conn = null;
    this.temp_red_plug_conn = null;
    this.temp_black_plug_conn = null;
    this.temp_dial_setting = null;

    this.initial_dial_setting_set = false;
    this.correct_order_set = false;
    
    this.parseEvents();
}

LogParser.prototype = 
{
    // Scan the events once to produce derived data
    parseEvents : function() {
        for (var i = 0; i < this.events.length; ++i) {
            debug('event name=' + this.events[i].name + ' value=' + this.events[i].value);
            if (this.events[i].name === 'connect') {
                this.parseConnect(this.events[i]);
            }
            else if (this.events[i].name === 'disconnect') {
                this.parseDisconnect(this.events[i]);
            }
            else if (this.events[i].name === 'multimeter_power') {
                this.parseMultimeterPower(this.events[i]);
            }
            else if (this.events[i].name === 'multimeter_dial') {
                this.parseMultimeterDial(this.events[i]);
            }
        }
    },
    
    parseConnect : function(event) {
        var comps = event.value.split('|');
        switch (comps[0]) {
        case 'red_probe':
            this.parseProbeConnection(event);
            this.parseRedProbeConnection(comps[1], event.time);
            break;
        case 'black_probe':
            this.parseProbeConnection(event);
            this.parseBlackProbeConnection(comps[1], event.time);
            break;
        case 'red_plug':
            this.parseRedPlugConnection(comps[1], event.time);
            break;
        case 'black_plug':
            this.parseBlackPlugConnection(comps[1], event.time);
            break;
        }
    },
    
    parseDisconnect : function(event) {
    },
    
    parseMultimeterPower : function(event) {
        this.temp_power_on = event.value;
        if (event.time < this.measure_submit_time) {
            this.power_on = event.value;
            if (event.value === true && !this.initial_dial_setting_set) {
                this.initial_dial_setting = this.submit_dial_setting;
                this.initial_dial_setting_set = true;
            }
        }
        if (this.temp_power_on &&
            !this.correct_order_set &&
            event.time < this.measure_submit_time)
        {
            if (this.temp_red_probe_conn &&
                this.temp_black_probe_conn &&
                this.temp_red_plug_conn &&
                this.temp_black_plug_conn &&
                this.temp_dial_setting)
            {
                this.correct_order = true;
                this.correct_order_set = true;
            }
        }
    },
    
    parseMultimeterDial : function(event) {
        this.temp_dial_setting = event.value;
        if (event.time < this.measure_submit_time) {
            this.submit_dial_setting = event.value;
        }
    },
    
    parseProbeConnection : function(event) {
    },
    
    parseRedProbeConnection : function(connectedTo, time) {
        this.temp_red_probe_conn = connectedTo;
        if (time < this.measure_submit_time) {
            this.submit_red_probe_conn = connectedTo;
        }
    },
    
    parseBlackProbeConnection : function(connectedTo, time) {
        this.temp_black_probe_conn = connectedTo;
        if (time < this.measure_submit_time) {
            this.submit_black_probe_conn = connectedTo;
        }
    },
    
    parseRedPlugConnection : function(connectedTo, time) {
        this.temp_red_plug_conn = connectedTo;
        if (time < this.measure_submit_time) {
            this.submit_red_plug_conn = connectedTo;
        }
    },
    
    parseBlackPlugConnection : function(connectedTo, time) {
        this.temp_black_plug_conn = connectedTo;
        if (time < this.measure_submit_time) {
            this.submit_black_plug_conn = connectedTo;
        }
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
    
    /*
     * Last time before measured resistance is submitted that the circuit is 
     * all connected.
     * 
     * Returns +Infinity if there's no 'make_circuit' events.
     */
    getLastCircuitMakeTime : function() {
        var end_time = this.measure_submit_time;
        var make_time = Infinity;
        for (var i = 0; i < this.events.length && this.events[i].time < end_time; ++i) {
            if (this.events[i].name === 'make_circuit') {
                make_time = this.events[i].time;
            }
        }
        return make_time;
    },
    
    getLastCircuitBreakTime : function() {
        var end_time = this.measure_submit_time;
        var break_time = -Infinity;
        for (var i = 0; i < this.events.length && this.events[i].time < end_time; ++i) {
            if (this.events[i].name === 'break_circuit') {
                break_time = this.events[i].time;
            }
        }
        return break_time;
    }
};
