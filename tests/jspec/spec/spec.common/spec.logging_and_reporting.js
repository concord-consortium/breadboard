describe 'Logging and Reporting'
    before
    end
    
    before_each
    end
    
    it "should be able to start and end a session"
      var activityLog = new sparks.Activity.ActivityLog();
      
      activityLog.beginSession();
      
      activityLog.currentSession().start_time.should.be_at_least 1
      activityLog.currentSession().end_time.should.be null
      
      activityLog.endSession();
      
      var startTime = activityLog.currentSession().start_time;
      activityLog.currentSession().end_time.should.be_at_least (startTime + 1)
    end
    
    it "should be able to start a session and log some stuff"
      var activityLog = new sparks.Activity.ActivityLog();
      
      activityLog.beginSession();
      activityLog.setValue("resistor 1 resistance", 200);
      activityLog.log("connect", "probe_red", "a2");
      
      activityLog.sessions[0].properties["resistor 1 resistance"].should.be 200
      activityLog.sessions[0].events[0].name.should.be "connect"
      activityLog.sessions[0].events[0].value.should.be "probe_red|a2"
    end
    
    it "should be able to serialize the question answers"
      
      var questionsHtml = $(fixture('questions'));
      
      questionsHtml.find('#answer_1_1_value_input').val("my answer 1");
      questionsHtml.find('#answer_1_1_unit_select').val("mV");
      questionsHtml.find('#answer_1_2_value_input').val("my answer 2");
      
      var forms = questionsHtml.find('form');
      var assessment = new sparks.Activity.Assessment();
      assessment.serializeQuestions(forms);
      
      assessment.forms[0].questions[0].input.should.be "my answer 1"
      assessment.forms[0].questions[0].select.should.be "mV"
      
      assessment.forms[0].questions[1].input.should.be "my answer 2"
      assessment.forms[0].questions[1].select.should.be undefined
      
    end
    
    it "should be able to score questions"
    
      var assessment = new sparks.Activity.Assessment();
      assessment.addQuestion(0, "1", "mV");
      assessment.addQuestion(1, "3", null);
      
      
      var questionsHtml = $(fixture('questions'));
      
      questionsHtml.find('#answer_1_1_value_input').val("1");
      questionsHtml.find('#answer_1_1_unit_select').val("mV");
      questionsHtml.find('#answer_1_2_value_input').val("2");
      
      var forms = questionsHtml.find('form');
      assessment.serializeQuestions(forms);
      assessment.scoreAnswers();
      
      assessment.questions[0].answerIsCorrect.should.be true
      assessment.questions[0].unitsIsCorrect.should.be true
      assessment.questions[1].answerIsCorrect.should.be false
      assessment.questions[1].unitsIsCorrect.should.be true
      
    end
    
    it "should be able to generate a report"
    
      var assessment = new sparks.Activity.Assessment();
      assessment.addQuestion(0, "1", "mV");
      assessment.addQuestion(1, "3", null);
      assessment.addQuestion(2, "5", "V");
      
      
      var questionsHtml = $(fixture('questions'));
      
      questionsHtml.find('#answer_1_1_value_input').val("1");
      questionsHtml.find('#answer_1_1_unit_select').val("mV");
      questionsHtml.find('#answer_1_2_value_input').val("2");
      questionsHtml.find('#answer_1_3_value_input').val("5");
      questionsHtml.find('#answer_1_3_unit_select').val("A");
      
      var forms = questionsHtml.find('form');
      assessment.serializeQuestions(forms);
      assessment.scoreAnswers();
      
      var table = assessment.generateReport();
      
      // table.find('th').each(function(i, value){
      //   console.log(i);
      //   console.log($(value).html());
      // });
      
    end
    
end
