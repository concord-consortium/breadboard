/*
 * A FeedbackItem is contains derived information from the activity log:
 * Grader parses the activity log and populates feedback items.
 * Reporter uses feedback items to generate the report.
 */
function FeedbackItem(maxPoints)
{
	// "correctness" on the scale of 0 to 4 for the purpose of labeling/coloring
	// 0 means incorrect, 4 correct, 1 thru 3 partially correct
    this.correct = 0; 
    
    this.label = '';
    this.desc = '';
    this.points = 0;
    this.maxPoints = (maxPoints === null || maxPoints === undefined ? 0 : maxPoints);
}

FeedbackItem.prototype =
{
	getPoints : function() {
		var points = 0;
		for (var key in this) {
			if (this[key] instanceof FeedbackItem) {
				points += this[key].getPoints();
			}
		}
		return points + this.points;
	},
	
	getMaxPoints: function() {
		var maxPoints = 0;
		for (var key in this) {
			if (this[key] instanceof FeedbackItem) {
				maxPoints += this[key].getMaxPoints();
			}
		}
		return maxPoints + this.maxPoints;
	}
};

function Feedback() {
	this.root = new FeedbackItem();

	this.root.reading = new FeedbackItem();
	this.root.reading.rated_r_value = new FeedbackItem(20);
	this.root.reading.rated_t_value = new FeedbackItem(5);

    this.root.t_range_value = new FeedbackItem(15);
    
	this.root.measuring = new FeedbackItem();
    this.root.measuring.probe_connection = new FeedbackItem(2);
    this.root.measuring.plug_connection = new FeedbackItem(5);
    this.root.measuring.knob_setting = new FeedbackItem(20);
    this.root.measuring.power_switch = new FeedbackItem(2);
    this.root.measuring.measured_r_value = new FeedbackItem(10);
    this.root.measuring.task_order = new FeedbackItem(6);
    
    this.root.within_tolerance = new FeedbackItem(5);
    
    this.root.time = new FeedbackItem();
    this.root.time.reading_time = new FeedbackItem(5);
    this.root.time.measuring_time = new FeedbackItem(5);
}
