//= require "setup-common"

/* FILE activity-log.js */

(function () {

    var sm = sparks.activities.sm;
    
    /* Log object structure
     * - session is the unit of upload to server
     * 
     *   SESSION
     *     start_time:
     *     end_time:
     *       events:
     *         - event
     *             name:
     *             value:
     *             time:
     */
    sm.Session = function () {
        this.start_time = null;
        this.end_time = null;
    };
    

    sm.ActivityLog = function () {
        this.session = new sm.Session();
    };
    
    sm.ActivityLog.prototype = {
    };
    
})();
