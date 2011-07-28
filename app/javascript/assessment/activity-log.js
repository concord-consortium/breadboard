//= require "../setup-common"

/*globals sparks */

/* FILE activity-log.js */

(function () {

    var activity = sparks.Activity;

    activity.Event = function (name, value, time) {
        this.name = name;
        this.value = value;
        this.time = time;
    };

    /* Log object structure
     * - session is the unit of upload to server
     * 
     *   SESSION
     *     start_time:
     *     end_time:
     *     sections:
     *       - section
     *           start_time:
     *           end_time:
     *           events:
     *             - event
     *                 name:
     *                 value:
     *                 time:
     *           questions:
     *             - question
     *                 id:
     *                 correct_answer:
     *                 answer:
     *                 unit:
     *                 correct:
     *                 start_time:
     *                 end_time:
     */
    activity.Session = function () {
        this.events = [];
        this.properties = [];
        this.start_time = null;
        this.end_time = null;
    };

    activity.ActivityLog = function ()
    {
        //console.log('ENTER ActivityLog');

        this.sessions = [];
        this.numSessions = 0;
    };

    activity.ActivityLog.prototype =
    {
        eventNames : { start_session: 1,
                       end_session: 1,
                       start_section: 1,
                       end_section: 1,
                       start_question: 1,
                       end_question: 1,
                       connect: 1,
                       disconnect: 1,
                       make_circuit: 1,
                       break_circuit: 1,
                       multimeter_dial: 1,
                       multimeter_power: 1,
                       resistor_nominal_value: 1,
                       resistor_real_value: 1,
                       resistor_display_value: 1 },

        beginSession : function() {
            var session = new activity.Session();
            
            // var questions = section.questions;
            // questions.push(new activity.Question('rated_resistance'));
            // questions.push(new activity.Question('rated_tolerance'));
            // questions.push(new activity.Question('measured_resistance'));
            // questions.push(new activity.Question('measured_tolerance'));
            // questions.push(new activity.Question('within_tolerance'));

            this.sessions.push(session);
            this.numSessions += 1;
            this.log('start_session');
        },
        
        endSession : function() {
            this.log('end_session');
        },

        currentSession : function() {
            return this.sessions[this.numSessions - 1];
        },

        setValue : function(name, value) {
          this.currentSession().properties[name] = value;
        },

        // Add event
        log : function(name) {
            var now = new Date().valueOf();
            var session = this.currentSession();

            if (!this.eventNames[name]) { 
                console.log('ERROR: add: Unknown log event name ' + name);
                session.events.push(new activity.Event('UNREGISTERED_NAME', name, now));
                return;
            }

            switch (name)
            {
            case 'connect':
              if (arguments.length < 3){
                console.log("ERROR: logging conection needs to have two parameters");
                return;
              }
              console.log('connect ' + arguments[1] + ' to ' + arguments[2]);
              session.events.push(new activity.Event('connect', arguments[1] + '|' + arguments[2], now));
              break;
            case 'make_circuit':
                session.events.push(new activity.Event('make_circuit', '', now));
                break;
            case 'break_circuit':
                session.events.push(new activity.Event('break_circuit', '', now));
                break;
            // case 'start_question':
            //     session.questions[arguments[1]].start_time = now;
            //     break;
            // case 'end_question':
            //     session.questions[arguments[1]].end_time = now;
            //     break;
            case 'start_session':
                session.start_time = now;
                break;
            case 'end_session':
                session.end_time = now;
                break;
            default:
                session.events.push(new activity.Event(name, arguments[1], now));
            }
        }
    };

})();
