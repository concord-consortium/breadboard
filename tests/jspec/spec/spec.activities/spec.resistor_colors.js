describe 'Activity 1: Resistor Colors'
    before
      Feedback = sparks.activities.mr.Feedback
      Grader = sparks.activities.mr.Grader
    end

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
      feedback.root.updatePoints();
    
      feedback.root.maxPoints.should.be 100
      
      feedback.root.reading.maxPoints.should.be 25
      feedback.root.reading.rated_r_value.maxPoints.should.be 20
      feedback.root.reading.rated_t_value.maxPoints.should.be 5
      
      feedback.root.t_range.t_range_value.maxPoints.should.be 15
      
      feedback.root.measuring.maxPoints.should.be 45
      feedback.root.measuring.probe_connection.maxPoints.should.be 2
      feedback.root.measuring.plug_connection.maxPoints.should.be 5
      feedback.root.measuring.knob_setting.maxPoints.should.be 20
      feedback.root.measuring.power_switch.maxPoints.should.be 2
      feedback.root.measuring.task_order.maxPoints.should.be 6
      
      feedback.root.t_range.within_tolerance.maxPoints.should.be 5
      
      feedback.root.time.maxPoints.should.be 10
      feedback.root.time.reading_time.maxPoints.should.be 5
      feedback.root.time.measuring_time.maxPoints.should.be 5
    end
    
    it "should grade a session correctly"
      // mr_data1.json: perfect answers
      var session = JSON.parse(fixture('mr_data_1.json')); 
      var grader = new sparks.activities.mr.Grader(session);
      var feedback = grader.grade();
      
      feedback.root.points.should.be 100
      
      feedback.root.reading.rated_r_value.points.should.be 20
      feedback.root.reading.rated_t_value.points.should.be 5
      feedback.root.reading.points.should.be 25
      
      feedback.root.t_range.t_range_value.points.should.be 15
      
      feedback.root.measuring.points.should.be 45
      feedback.root.measuring.probe_connection.points.should.be 2
      feedback.root.measuring.plug_connection.points.should.be 5
      feedback.root.measuring.knob_setting.points.should.be 20
      feedback.root.measuring.power_switch.points.should.be 2
      feedback.root.measuring.task_order.points.should.be 6
      
      feedback.root.t_range.within_tolerance.points.should.be 5
      
      feedback.root.time.points.should.be 10
      feedback.root.time.reading_time.points.should.be 5
      feedback.root.time.measuring_time.points.should.be 5
    end
    
    it "should do oneOff correctly"
    Grader.prototype.oneOff('12', '22').should.be true
      Grader.prototype.oneOff('0.2382', '0.2372').should.be true
      Grader.prototype.oneOff('405', '4050').should.be false
    end
    
    it "should do roundedMatch correctly"
      Grader.prototype.roundedMatch(12.9, 13, 2).should.be true
    end
    
end
