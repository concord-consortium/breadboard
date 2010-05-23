//= require "../setup-common"
//= require "grader"

/* FILE assessment.js */

(function () {

    var mr = sparks.activities.mr;

    /** 
     * Meant to hold everything needed for grading, such as rubric and grading
     * routines. Since there's no rubric objects defined yet, it may appear to
     * offer little more than Grader.
     */
    mr.Assessment = function (activity) {

        //console.log('ENTER Assessment');
        this.activity = activity;
        this.log = activity.log;
    };

    mr.Assessment.prototype = {

        grade : function(session) {
            var grader = new mr.Grader(session);
            return grader.grade(session);
        },

        receiveResultFromHTML : function(resultObj) {
            var section = this.log.currentSession().sections[0];
            var questions = section.questions;
            var value = null;

            //value = resultObj.rated_resistance.value;
            value = $('#rated_resistance_value_input').val();
            questions[0].answer = this.fieldIsEmpty(value) ? null : Number(value);
            questions[0].correct_answer = section.nominal_resistance;

            //value = resultObj.rated_resistance.units;
            value  = $('#rated_resistance_unit_select').children('option:selected').val();
            questions[0].unit = this.fieldIsEmpty(value) ? null : value;

            //value = resultObj.rated_tolerance.value.replace(/\s*%$/, '');
            value = $('#rated_tolerance_select').children('option:selected').val();
            value = value.replace(/\s*%$/, '');

            questions[1].answer = this.fieldIsEmpty(value) ? null : Number(value);
            questions[1].unit = '%';
            questions[1].correct_answer = section.tolerance;

            //value = resultObj.measured_resistance.value;
            value = $('#measured_r_value_input').val();
            questions[2].answer = this.fieldIsEmpty(value) ? null : Number(value);

            //value = resultObj.measured_resistance.units;
            value = $('#measured_r_unit_select').children('option:selected').val();
            questions[2].unit = this.fieldIsEmpty(value) ? null : value;

            questions[2].correct_answer = section.displayed_resistance;

            questions[3].answer = [];
            //value = resultObj.measured_tolerance.min;
            value = $('#t_range_min_value_input').val();
            questions[3].answer[0] = this.fieldIsEmpty(value) ? null : Number(value);

            //value = resultObj.measured_tolerance.max;
            value = $('#t_range_max_value_input').val();
            questions[3].answer[1] = this.fieldIsEmpty(value) ? null : Number(value);

            questions[3].unit = [];
            //value = resultObj.measured_tolerance.min_unit;
            value = $('#t_range_min_unit_select').children('option:selected').val();
            questions[3].unit[0] = this.fieldIsEmpty(value) ? null : value;

            //value = resultObj.measured_tolerance.max_unit;
            value = $('#t_range_max_unit_select').children('option:selected').val();
            questions[3].unit[1] = this.fieldIsEmpty(value) ? null : value;

            //value = resultObj.within_tolerance.value;
            value = $("input[@name='within_t_radio']:checked").val();
            questions[4].answer = this.fieldIsEmpty(value) ? null : value;
        },

        sendResultToHTML : function(resultObj, feedback) {
            var fb = feedback.root;
            resultObj.rated_resistance.correct = fb.reading.rated_r_value.correct;
            resultObj.rated_tolerance.correct = fb.reading.rated_t_value.correct;
            resultObj.measured_resistance.correct = fb.measuring.measured_r_value.correct;
            resultObj.measured_tolerance.correct = fb.t_range.t_range_value.correct;
            resultObj.within_tolerance.correct = fb.t_range.within_tolerance.correct;
        },

        fieldIsEmpty : function(formInput) {
            return formInput === null || formInput === undefined || formInput.length < 1;
        }
    };

})();
