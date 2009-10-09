function Question(id) {
    this.id = id;
}
Question.prototype = {
    id : '',
    correct_answer : '',
    answer : '',
    unit : '',
    correct : false
};

function Section() {
}
Section.prototype = {
    start_time : null,
    end_time : null,
    questions : []
};
    
function ActivityLog()
{
    //console.log('ENTER ActivityLog');
    this.sections = [new Section(), new Section(), new Section()];
    
    for (var i = 0; i < 3; ++i) {
        var questions = this.sections[i].questions;
        questions.push(new Question('rated_resistance'));
        questions.push(new Question('rated_tolerance'));
        questions.push(new Question('measured_resistance'));
        questions.push(new Question('measured_tolerance'));
        questions.push(new Question('within_tolerance'));
    }
}
ActivityLog.prototype =
{
    start_time : null,
    end_time : null,
    sections : [],
    
    add : function(name, value) {
        var now = new Date().valueOf();
        switch (name)
        {
        case 'start_activity':
            this.start_time = now; 
            this.sections[0].start_time = now;
            break;
        case 'start_resistor2':
            this.sections[0].end_time = now;
            this.sections[1].start_time = now;
            break;
        case 'start_resistor3':
            this.sections[1].end_time = now;
            this.sections[2].start_time = now;
            break;
        case 'end_activity':
            this.sections[2].end_time = now;
            this.end_time = new Date().valueOf();
            break;
        default:
            console.log('ERROR: add: Unknown log event name ' + name);
        }
    },
    
    formatDate : function(ms) {
        var date = new Date(ms);
        var s = this.fillZero(date.getMonth() + 1) + '/';
        s += this.fillZero(date.getDate()) + '/';
        s += String(date.getFullYear()) + ' ';
        s += this.fillZero(date.getHours()) + ':';
        s += this.fillZero(date.getMinutes()) + ':';
        s += this.fillZero(date.getSeconds()) + ' ';
        return s;
    },
    
    fillZero : function(val) {
        return val < 10 ? '0' + val : String(val);
    }
    
};

