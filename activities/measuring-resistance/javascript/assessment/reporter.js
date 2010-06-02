//= require <unit>
//= require "../setup-common"

/* FILE reporter.js */

(function () {

    var unit = sparks.unit;
    var mr = sparks.activities.mr;

    mr.Reporter = function (reportElem) {
        this.template = mr.config.root_dir + '/report-templates/spot-report.html';
        this.reportElem = reportElem;
    };

    mr.Reporter.prototype = {

        readingHintPath: sparks.config.root_dir + '/common/resources/hint1_colorcode.html',
        measuringHintPath: sparks.config.root_dir + '/common/resources/hint1_dmm.html',
        toleranceHintPath: sparks.config.root_dir + '/common/resources/hint1_calctolerance.html',

        red : '#cc3300',
        red2 : '#cc9933',
        orange : '#ff6600',
        blue : '#0099cc',
        green :'#339933',

        dialLabels : { r_2000k: '\u2126 - 2000k',
            r_200k: '\u2126 - 200k',
            r_20k: '\u2126 - 20k',
            r_2000: '\u2126 - 2000',
            r_200: '\u2126 - 200',
            dcv_1000: 'DCV - 1000',
            dcv_200: 'DCV - 200',
            dcv_20: 'DCV - 20',
            dcv_2000m: 'DCV - 2000m',
            dcv_200m: 'DCV - 200m',
            acv_750: 'ACV - 750',
            acv_200: 'ACV - 200',
            p_9v: '1.5V 9V',
            dca_200mc: 'DCA - 200\u03bc',
            dca_2000mc: 'DCA - 2000\u03bc',
            dca_20m: 'DCA - 20m',
            dca_200m: 'DCA - 200m',
            c_10a: '10A',
            hfe: 'hFE',
            diode: 'Diode'
        },

        report: function(session, feedback, callback) {
            var reporter = this;
            this.reportElem.load(this.template, '', function() {
                reporter.sessionReport(session, feedback);
            });
        },

        sessionReport : function(session, feedback) {
            var studentName = jQuery.cookie('student_name');
            if (studentName) {
                $('#student_name').text(studentName.replace('+', ' '));
            }
            var activityName = jQuery.cookie('activity_name');
            if (activityName) {
                $('#activity_name').text(activityName.replace('+', ' '));
            }
            var attemptNum = jQuery.cookie('attempt_num');
            if (attemptNum) {
                $('#attempt_num').text(attemptNum);
            }
            $('#date').text(new Date().toString().slice(0, 15));

            var text = '';
            var questions = session.sections[0].questions;
            var color;

            var fb = feedback.root.items.reading.items.rated_r_value;
            $('#rated_r_correct').text(unit.res_str(questions[0].correct_answer));
            text = questions[0].answer ? questions[0].answer + questions[0].unit : 'No Answer';
            this.setAnswerTextWithColor('#rated_r_answer', text, fb);
            $('#rated_r_points').text(fb.points + ' / ' + fb.max_points);
            this.addFeedback($('#rated_r_feedback'), fb, this.readingHintPath);

            fb = feedback.root.items.reading.items.rated_t_value;
            $('#rated_t_correct').text(questions[1].correct_answer * 100 + '%');
            text = questions[1].answer ? questions[1].answer + questions[1].unit : 'No Answer';
            this.setAnswerTextWithColor('#rated_t_answer', text, fb);
            $('#rated_t_points').text(fb.points + ' / ' + fb.max_points);
            this.addFeedback($('#rated_t_feedback'), fb, this.readingHintPath);

            fb = feedback.root.items.t_range.items.range_values;
            $('#t_range_correct').text('[' + unit.res_str(questions[3].correct_answer[0]) + ', ' + unit.res_str(questions[3].correct_answer[1]) + ']');
            text = (questions[3].answer[0] || questions[3].answer[1]) ? '[' + String(questions[3].answer[0]) + questions[3].unit[0] + ', ' + questions[3].answer[1] + questions[3].unit[1] + ']' : 'No Answer';
            this.setAnswerTextWithColor('#t_range_answer', text, fb);
            $('#t_range_value_points').text(fb.points + ' / ' + fb.max_points);
            this.addFeedback($('#t_range_feedback'), fb, this.toleranceHintPath);

            fb = feedback.root.items.t_range.items.in_out;
            $('#within_correct').text(questions[4].correct_answer);
            text = questions[4].answer ? questions[4].answer : 'No Answer';
            this.setAnswerTextWithColor('#within_answer', text, fb);
            $('#within_points').text(fb.points + ' / ' + fb.max_points);
            this.addFeedback($('#within_feedback'), fb, this.toleranceHintPath);

            fb = feedback.root.items.time.items.reading;
            this.setAnswerTextWithColor('#reading_time', sparks.util.timeLapseStr(questions[0].start_time, questions[1].end_time), fb);
            $('#reading_time_points').text(fb.points + ' / ' + fb.max_points);
            this.addFeedback($('#reading_time_feedback'), fb, this.readingHintPath);

            fb = feedback.root.items.time.items.measuring;
            this.setAnswerTextWithColor('#measuring_time', sparks.util.timeLapseStr(questions[2].start_time, questions[2].end_time), fb);
            $('#measuring_time_points').text(fb.points + ' / ' + fb.max_points);
            this.addFeedback($('#measuring_time_feedback'), fb, this.measuringHintPath);

            fb = feedback.root.items.measuring.items.probe_connection;
            if (fb.correct == 4) {
                this.setTextWithColor('#probe_connection', fb.desc , this.green);
            }
            else {
                this.setTextWithColor('#probe_connection', fb.desc, this.red);
            }

            fb = feedback.root.items.measuring.items.plug_connection;
            if (fb.correct) {
                this.setTextWithColor('#plug_connection', fb.desc, this.green);
            }
            else {
                this.setTextWithColor('#plug_connection', fb.desc, this.red);
            }

            fb = feedback.root.items.measuring.items.knob_setting;

            //var i_knob = feedback.initial_dial_setting;
            var f_knob = feedback.submit_dial_setting;
            var o_knob = feedback.optimal_dial_setting;

            $('#knob_setting_correct').text(this.dialLabels[feedback.optimal_dial_setting]);

            /*
            if (i_knob == o_knob) {
                color = this.green;
            }
            else if (sparks.activities.mr.Grader.prototype.isResistanceKnob(i_knob)) {
                color = this.orange;
            }
            else {
                color = this.red;
            }
            this.setTextWithColor('#initial_knob_answer', this.dialLabels[feedback.initial_dial_setting], color);
            */

            if (f_knob == o_knob) {
                color = this.green;
            }
            else if (sparks.activities.mr.Grader.prototype.isResistanceKnob(f_knob)) {
                color = this.orange;
            }
            else {
                color = this.red;
            }
            this.setTextWithColor('#knob_setting_answer', this.dialLabels[feedback.submit_dial_setting], color);

            $('#knob_setting_points').text(fb.points + ' / ' + fb.max_points);
            this.addFeedback($('#knob_setting_feedback'), fb, this.measuringHintPath);

            if (feedback.root.items.measuring.items.power_switch.correct == 4) {
                this.setTextWithColor('#power_switch', 'On', this.green);
            }
            else {
                this.setTextWithColor('#power_switch', 'Off', this.red);
            }

            //console.log('initial=' + this.log.getInitialDialSetting());
            //console.log('final=' + this.log.getFinalDialSetting());

            fb = feedback.root.items.measuring.items.measured_r_value;
            $('#measured_r_correct').text(unit.res_str(questions[2].correct_answer));
            text = questions[2].answer ? questions[2].answer + questions[2].unit : 'No Answer';
            this.setAnswerTextWithColor('#measured_r_answer', text, fb);
            $('#measured_r_points').text(fb.points + ' / ' + fb.max_points);
            this.addFeedback($('#measured_r_feedback'), fb, this.measuringHintPath);

            fb = feedback.root.items.measuring.items.plug_connection;
            if (fb.correct == 4) {
                this.setTextWithColor('#plug_connection_answer', 'Correct', this.green);
            }
            else {
                this.setTextWithColor('#plug_connection_answer', 'Incorrect', this.red);
            }
            $('#plug_connection_points').text(fb.points + ' / ' + fb.max_points);
            this.addFeedback($('#plug_connection_feedback'), fb, this.measuringHintPath);

            fb = feedback.root.items.measuring.items.probe_connection;
            if (fb.correct == 4) {
                this.setTextWithColor('#probe_connection_answer', 'Correct', this.green);
            }
            else {
                this.setTextWithColor('#probe_connection_answer', 'Incorrect', this.red);
            }
            $('#probe_connection_points').text(fb.points + ' / ' + fb.max_points);
            this.addFeedback($('#probe_connection_feedback'), fb, this.measuringHintPath);

            fb = feedback.root.items.measuring.items.power_switch;
            if (fb.correct == 4) {
                this.setTextWithColor('#power_switch_answer', 'Correct', this.green);
            }
            else {
                this.setTextWithColor('#power_switch_answer', 'Incorrect', this.red);
            }
            $('#power_switch_points').text(fb.points + ' / ' + fb.max_points);
            this.addFeedback($('#power_switch_feedback'), fb, this.measuringHintPath);

            fb = feedback.root.items.measuring.items.task_order;
            if (fb.correct == 4) {
                this.setTextWithColor('#task_order_answer', 'Correct', this.green);
            }
            else {
                this.setTextWithColor('#task_order_answer', 'Incorrect', this.red);
            }
            $('#task_order_points').text(fb.points + ' / ' + fb.max_points);
            this.addFeedback($('#task_order_feedback'), fb, this.measuringHintPath);

            fb = feedback.root.items.reading;
            $('#reading_points').html('<b>' + fb.points + ' / ' +
                    fb.max_points + '</b>');

            fb = feedback.root.items.measuring;
            $('#measuring_points').html('<b>' + fb.points + ' / ' +
                    fb.max_points + '</b>');

            fb = feedback.root.items.t_range;
            $('#t_range_points').html('<b>' + fb.points + ' / ' +
                    fb.max_points + '</b>');

            fb = feedback.root.items.time;
            $('#time_points').html('<b>' + fb.points + ' / ' +
                    fb.max_points + '</b>');

            fb = feedback.root;
            $('#total_points').html('<b>' + fb.points + ' / ' +
                    fb.max_points + '</b>');

            this.addHelpLinks(feedback);
        },

        addHelpLinks: function(feedback) {
            var rootDir = sparks.config.root_dir;

            var fb = feedback.root.items.reading;

            if (fb.points != fb.max_points) {
                this.imageLink($('#reading_tutorial_link'),
                    rootDir + '/common/icons/tutorial.png',
                    this.readingHintPath);
            }

            fb = feedback.root.items.measuring;
            if (fb.points != fb.max_points) {
                this.imageLink($('#measuring_tutorial_link'),
                    rootDir + '/common/icons/tutorial.png',
                    this.measuringHintPath);
            }

            fb = feedback.root.items.t_range.items.range_values;
            if (fb.points != fb.max_points) {
                this.imageLink($('#t_range_tutorial_link'),
                    rootDir + '/common/icons/tutorial.png',
                    this.toleranceHintPath);
            }
        },

        setAnswerTextWithColor : function(elemId, text, feedback) {
            var color;
            switch (feedback.correct)
            {
            case 0: color = this.red; break;
            case 1: color = this.red2; break;
            case 2: color = this.orange; break;
            case 3: color = this.blue; break;
            case 4: color = this.green; break;
            }
            this.setTextWithColor(elemId, text, color);
        },

        setTextWithColor : function(elemId, text, color) {
            $(elemId).text(text);
            $(elemId).attr('style', 'color: ' + color + ';');
        },

        imageLink: function(container, imageUrl, linkUrl) {
          var a = $('<a></a>').addClass('no_deco');
          a.attr({ href: linkUrl, title: 'Click for SPARKS Help!', target: 'feedback' });
          var img = $('<img></img>').addClass('no_border');
          img.attr({ src: imageUrl, align: 'ABSMIDDLE' });
          img.css({ margin: '4px' });
          a.append(img);
          container.html(a);
        },

        addFeedback: function (elem, fb, tutorialURL) {
            var fbs = fb.feedbacks;
            for (var i = 0; i < fbs.length; ++i) {
                elem.append(this.getFeedbackLine(fbs[i], tutorialURL));
                elem.append($('<br />'));
            }
        },

        getFeedbackLine: function (fb, tutorialURL) {
            var imgPath = sparks.config.root_dir + '/common/icons/spark.png';
            var img = $('<img></img>').addClass('no_border').attr('src', imgPath);

            var a = $('<a></a>').attr('href', '').append(img);
            a.append(fb[0]);
            var line = $('<nobr></nobr>');
            line.append(a);

            var tutorialLink = $('<a>Tutorial</a>');
            tutorialLink.attr({ href: tutorialURL, target: 'tutorial'});
            tutorialLink.css('float', 'right');
            var tutorialButton = tutorialLink.button().addClass('dialog_button');

            var closeButton = $('<button>Close</button>)').button().addClass('dialog_button');
            closeButton.css('float', 'right');
            var div = $('<div></div>').html(fb[1]);
            div.attr('title', '<img src="' + imgPath + '" /> SPARKS Feedback');
            div.append($('<p />')).append(tutorialButton).append(closeButton);
            var dialog = div.dialog({ autoOpen: false });

            a.click(function (event) {
                div.dialog('open');
                event.preventDefault();
            });
            tutorialButton.click(function (event) {
                div.dialog('close');
            });
            closeButton.click(function (event) {
                div.dialog('close');
            });
            return line;
        }
    };

})();
