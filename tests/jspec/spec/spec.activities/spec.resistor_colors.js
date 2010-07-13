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
    
    it "should grade a session correctly"
      // mr_data1.json: perfect answers
      var session = JSON.parse(fixture('mr_data_1.json'))
      var rubric = JSON.parse(fixture('rubric-mr.json'))

      var grader = new sparks.activities.mr.Grader(session, rubric);
      var feedback = grader.grade();
      
      feedback.root.points.should.be 100
      feedback.root.items.reading.items.rated_r_value.points.should.be 20
      feedback.root.items.reading.items.rated_t_value.points.should.be 5
      feedback.root.items.reading.points.should.be 25
      
      feedback.root.items.t_range.items.range_values.points.should.be 15
      
      feedback.root.items.measuring.points.should.be 45
      feedback.root.items.measuring.items.probe_connection.points.should.be 2
      feedback.root.items.measuring.items.plug_connection.points.should.be 5
      feedback.root.items.measuring.items.knob_setting.points.should.be 20
      feedback.root.items.measuring.items.power_switch.points.should.be 2
      feedback.root.items.measuring.items.task_order.points.should.be 6
      
      feedback.root.items.t_range.items.in_out.points.should.be 5
      
      feedback.root.items.time.points.should.be 10
      feedback.root.items.time.items.reading.points.should.be 5
      feedback.root.items.time.items.measuring.points.should.be 5
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
