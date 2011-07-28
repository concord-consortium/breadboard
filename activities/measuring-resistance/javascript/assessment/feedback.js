//= require <helpers/util>
//= require "../setup-common"

/* FILE feedback.js */

(function () {

    var util = sparks.util;
    var mr = sparks.activities.mr;

    /** 
     * rubric
     *   :name
     *   :version
     *   :description
     *   :variables
     *     :rated_resistance
     *       :description
     *       :value
     *     :rated_tolerance
     *       :description
     *       :value
     *   :max_points
     *   :items
     *     :reading
     *       :description
     *       :max_points
     *       :items
     *         :rated_r_value
     *           :description
     *           :max_points
     *           :feedback
     *             :messages
     *               :correct
     *                 :description
     *                 :short_message
     *                 :long_message
     *               :incorrect
     *         :rated_t_value
     *     :measuring
     *       :items
     *         :measured_r_value
     *         :plug_connection
     *         :probe_connection
     *         :knob_setting
     *         :power_switch
     *         :task_order
     *     :t_range
     *       :items
     *         :range_values
     *         :in_out
     *     :time
     *       :items
     *         :reading
     *         :measuring
     */

    // rubric is a json object
    mr.Feedback = function (rubric) {
        this.root = util.cloneSimpleObject(rubric);
        //console.log(JSON.stringify(this.root));
        
        this.optimal_dial_setting = '';
        this.initial_dial_setting = '';
        this.final_dial_setting = '';
        this.time_reading = 0;
        this.time_measuring = 0;

        this.root.items.reading.items.rated_r_value.processPatterns = function (key, messages, subs) {
            if (key === 'power_ten') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                        '$1<font color="blue"><i>' + subs[0] +
                        '</i></font>$2<font color="blue"><i>' + subs[1] + '</i></font>$3');
            }
            else if (key === 'unit') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                        '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
            }
            return messages;
        };

        this.root.items.reading.items.rated_t_value.processPatterns = function (key, messages, subs) {
            if (key === 'incorrect') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="red"><i>' + subs[1] +
                    '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
            }
            return messages;
        };

        this.root.items.measuring.items.measured_r_value.processPatterns = function (key, messages, subs) {
            if (key === 'incomplete') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                        '$1<font color="blue"><i>' + subs[0] +
                        '</i></font>$2<font color="red"><i>' + subs[1] + '</i></font>$3');
            }
            else if (key === 'power_ten') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                        '$1<font color="orange"><i>' + subs[0] +
                        '</i></font>$2<font color="orange"><i>' + subs[1] +
                        '</i></font>$3<font color="blue"><i>' + subs[2] +
                        '</i></font>$4<font color="blue"><i>' + subs[3] +
                        '</i></font>$5<font color="blue"><i>' + subs[4] + '</i></font>$6');
            }
            else if (key === 'unit') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                        '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
            }
            return messages;
        };

        this.root.items.measuring.items.knob_setting.processPatterns = function (key, messages, subs) {
            if (key === 'suboptimal') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                        '$1<font color="orange"><i>' + subs[1] +
                        '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
            }
            return messages;
        };

        this.root.items.t_range.items.range_values.processPatterns = function (key, messages, subs) {
            if (key === 'correct' || key === 'rounded' ||
                key === 'correct_wrong_prev_r' || key === 'correct_wrong_prev_t' ||
                key === 'correct_wrong_prev_rt' || key === 'rounded_wrong_prev_r' ||
                key === 'rounded_wrong_prev_t' || key === 'rounded_wrong_prev_rt')
            {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="blue"><i>' + subs[1] +
                    '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
            }
            else if (key === 'inaccurate' || key === 'wrong' ||
                key === 'inaccurate_wrong_prev_r' || key === 'inaccurate_wrong_prev_t' ||
                key === 'inaccurate_wrong_prev_rt')
            {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                    '$1<font color="red"><i>' + subs[1] +
                    '</i></font>$2<font color="blue"><i>' + subs[0] + '</i></font>$3');
            }
            return messages;
        };

        this.root.items.t_range.items.in_out.processPatterns = function (key, messages, subs) {
            if (key === 'correct' || key === 'incorrect') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)\$\{.*\}(.*)/m,
                        '$1<font color="green"><i>' + subs[0] +
                        '</i></font>$2<font color="blue"><i>' + subs[1] +
                        '</i></font>$3<font color="blue"><i>' + subs[2] +
                        '</i></font>$4<font color="green"><i>' + subs[3] +
                        '</i></font>$5<font color="green"><i>' + subs[4] + '</i></font>$6');
            }
            return messages;
        };

        this.root.items.time.items.reading.processPatterns = function (key, messages, subs) {
            if (key === 'slow') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                        '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
            }
            return messages;
        };

        this.root.items.time.items.measuring.processPatterns = function (key, messages, subs) {
            if (key === 'slow') {
                messages[1] = messages[1].replace(/(.*)\$\{.*\}(.*)/m,
                        '$1<font color="red"><i>' + subs[0] + '</i></font>$2');
            }
            return messages;
        };

    };
    
    mr.Feedback.prototype = {
            
        addFeedback: function (node, key) {
            //console.log('key=' + key);
            //console.log('addFeedback for: key=' + key + ', ' + node.description);
            var messages = [];
            messages[0] = node.feedback.messages[key].short_message;
            messages[1] = node.feedback.messages[key].long_message;
            var subs = Array.prototype.slice.call(arguments, 2);
            if (!node.feedbacks) { node.feedbacks = []; }
            if (node.processPatterns) {
                node.feedbacks.push(node.processPatterns(key, messages, subs));
            }
            else {
                node.feedbacks.push(messages);
            }
        },
        
        updatePoints: function () {
            this._updatePoints(this.root);
        },
        
        _updatePoints: function (node) {
            var key, pair, points, maxPoints;

            if (node.items) {
                points = 0;
                maxPoints = 0;
                for (key in node.items) {
                    pair = this._updatePoints(node.items[key]);
                    points += pair[0];
                    maxPoints += pair[1];
                }
                node.points = points;
                node.maxPoints = maxPoints;
            }
            return [node.points, node.maxPoints];
        },
        
        processPatterns: function (key, messages, substitutions) {
            return messages;
        }
    };

})();
