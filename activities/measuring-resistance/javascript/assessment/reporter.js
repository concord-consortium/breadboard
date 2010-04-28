function Reporter(assessment)
{
    this.activity = assessment.activity;
    this.template = this.activity.root_dir + '/report-templates/spot-report.html';
    this.reportElem = this.activity.reportElem;
}

Reporter.prototype =
{
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
    
    reportOnSession : function(session, feedback) {
        var reporter = this;
        this.reportElem.load(this.template, '', function() {
            reporter.sessionReport(session, feedback);
            //this.reportElem.data('title.dialog', 'Performance Report');
            //this.reportElem.dialog('open');
            reporter.activity.buttonize();
        });
    },
    
    sessionReport : function(session, feedback) {
        var text = '';
        var questions = session.sections[0].questions;
        var color;
        
        var fb = feedback.root.reading.rated_r_value;
        $('#rated_r_correct').text(Unit.res_str(questions[0].correct_answer));
        text = questions[0].answer ? questions[0].answer + questions[0].unit : 'No Answer';
        this.setAnswerTextWithColor('#rated_r_answer', text, fb);
        $('#rated_r_points').text(fb.getPoints());
        this.addFeedback($('#rated_r_feedback'), fb);
        
        fb = feedback.root.reading.rated_t_value;
        $('#rated_t_correct').text(questions[1].correct_answer * 100 + '%');
        text = questions[1].answer ? questions[1].answer + questions[1].unit : 'No Answer';
        this.setAnswerTextWithColor('#rated_t_answer', text, fb);
        $('#rated_t_points').text(fb.getPoints());
        this.addFeedback($('#rated_t_feedback'), fb);
        
        fb = feedback.root.t_range_value;
        $('#t_range_correct').text(Unit.res_str(questions[3].correct_answer[0]) + ' .. ' + Unit.res_str(questions[3].correct_answer[1]));
        text = (questions[3].answer[0] || questions[3].answer[1]) ? String(questions[3].answer[0]) + questions[3].unit[0] + ' .. ' + questions[3].answer[1] + questions[3].unit[1] : 'No Answer';
        this.setAnswerTextWithColor('#t_range_answer', text, fb);
        this.addFeedback($('#t_range_feedback'), fb);

        fb = feedback.root.within_tolerance;
        $('#within_correct').text(questions[4].correct_answer);
        text = questions[4].answer ? questions[4].answer : 'No Answer';
        this.setAnswerTextWithColor('#within_answer', text, fb);
        $('#within_points').text(fb.getPoints());
        this.addFeedback($('#within_feedback'), fb);

        fb = feedback.root.time.reading_time;
        this.setAnswerTextWithColor('#reading_time', sparks.util.timeLapseStr(questions[0].start_time, questions[1].end_time), fb);
        $('#reading_time_points').text(fb.getPoints());
        this.addFeedback($('#reading_time_feedback'), fb);

        fb = feedback.root.time.measuring_time;
        this.setAnswerTextWithColor('#measuring_time', sparks.util.timeLapseStr(questions[2].start_time, questions[2].end_time), fb);
        $('#measuring_time_points').text(fb.getPoints());
        this.addFeedback($('#measuring_time_feedback'), fb);
        
        fb = feedback.root.measuring.probe_connection;
        if (fb.correct == 4) {
            this.setTextWithColor('#probe_connection', fb.desc , this.green);
        }
        else {
            this.setTextWithColor('#probe_connection', fb.desc, this.red);
        }
        
        fb = feedback.root.measuring.plug_connection;
        if (fb.correct) {
            this.setTextWithColor('#plug_connection', fb.desc, this.green);
        }
        else {
            this.setTextWithColor('#plug_connection', fb.desc, this.red);
        }

        fb = feedback.root.measuring.knob_setting;
        
        //var i_knob = feedback.initial_dial_setting;
        var f_knob = feedback.submit_dial_setting;
        var o_knob = feedback.optimal_dial_setting;
        
        $('#knob_setting_correct').text(this.dialLabels[feedback.optimal_dial_setting]);
        
        /*
        if (i_knob == o_knob) {
        	color = this.green;
        }
        else if (Grader.prototype.isResistanceKnob(i_knob)) {
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
        else if (Grader.prototype.isResistanceKnob(f_knob)) {
        	color = this.orange;
        }
        else {
        	color = this.red;
        }
        this.setTextWithColor('#knob_setting_answer', this.dialLabels[feedback.submit_dial_setting], color);
        
        $('#knob_setting_points').text(fb.getPoints());
        this.addFeedback($('#knob_setting_feedback'), fb);
        
        if (feedback.root.measuring.power_switch.correct == 4) {
        	this.setTextWithColor('#power_switch', 'On', this.green);
        }
        else {
        	this.setTextWithColor('#power_switch', 'Off', this.red);
        }
        
        //console.log('initial=' + this.log.getInitialDialSetting());
        //console.log('final=' + this.log.getFinalDialSetting());
        
        fb = feedback.root.measuring.measured_r_value;
        $('#measured_r_correct').text(Unit.res_str(questions[2].correct_answer));
        text = questions[2].answer ? questions[2].answer + questions[2].unit : 'No Answer';
        this.setAnswerTextWithColor('#measured_r_answer', text, fb);
        $('#measured_r_points').text(fb.getPoints());
        this.addFeedback($('#measured_r_feedback'), fb);
        
        fb = feedback.root.measuring.plug_connection;
        if (fb.correct == 4) {
            this.setTextWithColor('#plug_connection_answer', 'Correct', this.green);
        }
        else {
            this.setTextWithColor('#plug_connection_answer', 'Incorrect', this.red);
        }
        $('#plug_connection_points').text(fb.getPoints());
        this.addFeedback($('#plug_connection_feedback'), fb);

        fb = feedback.root.measuring.probe_connection;
        if (fb.correct == 4) {
            this.setTextWithColor('#probe_connection_answer', 'Correct', this.green);
        }
        else {
            this.setTextWithColor('#probe_connection_answer', 'Incorrect', this.red);
        }
        $('#probe_connection_points').text(fb.getPoints());
        this.addFeedback($('#probe_connection_feedback'), fb);

        fb = feedback.root.measuring.power_switch;
        if (fb.correct == 4) {
            this.setTextWithColor('#power_switch_answer', 'Correct', this.green);
        }
        else {
            this.setTextWithColor('#power_switch_answer', 'Incorrect', this.red);
        }
        $('#power_switch_points').text(fb.getPoints());
        this.addFeedback($('#power_switch_feedback'), fb);
        
        fb = feedback.root.measuring.task_order;
        if (fb.correct == 4) {
            this.setTextWithColor('#task_order_answer', 'Correct', this.green);
        }
        else {
            this.setTextWithColor('#task_order_answer', 'Incorrect', this.red);
        }
        $('#task_order_points').text(fb.getPoints());
        this.addFeedback($('#task_order_feedback'), fb);
        
        fb = feedback.root.reading;
        $('#reading_points').html('<b>' + fb.getPoints() + ' of ' +
                fb.getMaxPoints() + '</b>');
        
        fb = feedback.root.measuring;
        $('#measuring_points').html('<b>' + fb.getPoints() + ' of ' +
                fb.getMaxPoints() + '</b>');
        
        fb = feedback.root.t_range_value;
        $('#t_range_points').html('<b>' + fb.getPoints() + ' of ' +
                fb.getMaxPoints() + '</b>');
        
        fb = feedback.root.time;
        $('#time_points').html('<b>' + fb.getPoints() + ' of ' +
                fb.getMaxPoints() + '</b>');

        fb = feedback.root;
        $('#total_points').html('<b>' + fb.getPoints() + ' of ' +
                fb.getMaxPoints() + '</b>');
        
        this.addHelpLinks(feedback);
    },
    
    addHelpLinks: function(feedback) {
        var rootDir = sparks.config.root_dir;

        var fb = feedback.root.reading;
        if (fb.getPoints() != fb.getMaxPoints()) {
            this.imageLink($('#reading_tutorial_link'),
                rootDir + '/common/icons/tutorial.png',
                rootDir + '/common/resources/hint1_colorcode.html');
        }

        fb = feedback.root.measuring;
        if (fb.getPoints() != fb.getMaxPoints()) {
            this.imageLink($('#measuring_tutorial_link'),
                rootDir + '/common/icons/tutorial.png',
                rootDir + '/common/resources/MeasureResMovie/index.html');
        }

        fb = feedback.root.t_range_value;
        if (fb.getPoints() != fb.getMaxPoints()) {
            this.imageLink($('#t_range_tutorial_link'),
                rootDir + '/common/icons/tutorial.png',
                rootDir +'/common/resources/hint1_calctolerance.html');
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
      a.append(img);
      container.html(a);
    },
    
    addFeedback: function (elem, fb) {
        var fbs = fb.feedbacks;
        var t = '';
        var a = null;
        var ddiv = null;
        var dialogs = [];
        for (var i = 0; i < fbs.length; ++i) {
            elem.append(this.getFeedbackLine(fbs[i]).append($('<br />')));
        }
    },
    
    getFeedbackLine: function (fb) {
        var img = $('<img></img>').addClass('no_border');
        img.attr('src', sparks.config.root_dir + '/common/icons/spark.png');
        
        var a = $('<a></a>').attr('href', '').append(img);
        a.append(fb[0]);
        
        var div = $('<div></div>').html(fb[1]);
        var dialog = div.dialog({ autoOpen: false });
        
        a.click(function (event) {
            div.dialog('open');
            event.preventDefault();
        });
        return a;
    }
};
