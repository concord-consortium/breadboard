describe 'Activity 1: Resistor Colors'

    it "should correctly enable/disable elements"
        $('#messages').html('mello')
        $('#activity_body').html('activity body');
        //$('#activity_body').load('../../../activities/resistor-colors/index.html', {}, function() {
        //$('#activity_body').load('index.html', {}, function() {
            //$('#messages').html(typeof ResistorActivity)
            //jspec_sparks.activity = new ResistorActivity()
            //jspec_sparks.activity.initDocument()
            //jspec_sparks.activity.onFlashDone()
            //$('#messages').html('[' + $('input, select') + ']')
            //$('#messages').html('Hello')
        //})
        //true.should.be false
    end
    
    it "should calculate max points correctly"
        var feedback = new Feedback();
    
    	feedback.root.getMaxPoints().should.be 100
    	
    	feedback.root.reading.getMaxPoints().should.be 25
    	feedback.root.reading.rated_r_value.getMaxPoints().should.be 20
    	feedback.root.reading.rated_t_value.getMaxPoints().should.be 5
    	
    	feedback.root.t_range.t_range_value.getMaxPoints().should.be 15
    	
    	feedback.root.measuring.getMaxPoints().should.be 45
    	feedback.root.measuring.probe_connection.getMaxPoints().should.be 2
    	feedback.root.measuring.plug_connection.getMaxPoints().should.be 5
    	feedback.root.measuring.knob_setting.getMaxPoints().should.be 20
    	feedback.root.measuring.power_switch.getMaxPoints().should.be 2
    	feedback.root.measuring.task_order.getMaxPoints().should.be 6
    	
    	feedback.root.t_range.within_tolerance.getMaxPoints().should.be 5
    	
    	feedback.root.time.getMaxPoints().should.be 10
    	feedback.root.time.reading_time.getMaxPoints().should.be 5
    	feedback.root.time.measuring_time.getMaxPoints().should.be 5
    end
    
    it "should grade a session correctly"
    	// mr_data1.json: perfect answers
    	var session = JSON.parse(fixture('mr_data_1.json')); 
    	var grader = new Grader(session);
    	var feedback = grader.grade();
    	
    	feedback.root.getPoints().should.be 100
    	
    	feedback.root.reading.rated_r_value.getPoints().should.be 20
    	feedback.root.reading.rated_t_value.getPoints().should.be 5
    	feedback.root.reading.getPoints().should.be 25
    	
    	feedback.root.t_range.t_range_value.getPoints().should.be 15
    	
    	feedback.root.measuring.getPoints().should.be 45
    	feedback.root.measuring.probe_connection.getPoints().should.be 2
    	feedback.root.measuring.plug_connection.getPoints().should.be 5
    	feedback.root.measuring.knob_setting.getPoints().should.be 20
    	feedback.root.measuring.power_switch.getPoints().should.be 2
    	feedback.root.measuring.task_order.getPoints().should.be 6
    	
    	feedback.root.t_range.within_tolerance.getPoints().should.be 5
    	
    	feedback.root.time.getPoints().should.be 10
    	feedback.root.time.reading_time.getPoints().should.be 5
    	feedback.root.time.measuring_time.getPoints().should.be 5
    end
    
end
