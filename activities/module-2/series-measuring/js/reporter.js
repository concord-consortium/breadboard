//= require <unit>
//= require "setup-common"

/* FILE reporter.js */

(function () {

    var unit = sparks.unit;
    var sm = sparks.activities.sm;

    sm.Reporter = function (reportElem) {
        this.template = sm.config.root_dir + '/report-template.html';
        this.reportElem = reportElem;
    };

    sm.Reporter.prototype = {

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

        report: function (session, feedback) {
            var reporter = this;
            this.reportElem.load(this.template, '', function () {
                reporter.sessionReport(session, feedback);
            });
        },

        sessionReport: function (session, feedback) {
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
        },

        setAnswerTextWithColor: function (elemId, text, feedback) {
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

        setTextWithColor: function (elemId, text, color) {
            $(elemId).text(text);
            $(elemId).attr('style', 'color: ' + color + ';');
        },

        imageLink: function (container, imageUrl, linkUrl) {
          var a = $('<a></a>').addClass('no_deco');
          a.attr({ href: linkUrl, title: 'Click for SPARKS Help!', target: 'feedback' });
          var img = $('<img></img>').addClass('no_border');
          img.attr({ src: imageUrl, align: 'ABSMIDDLE' });
          img.css({ margin: '4px' });
          a.append(img);
          container.html(a);
        }
    };

})();
