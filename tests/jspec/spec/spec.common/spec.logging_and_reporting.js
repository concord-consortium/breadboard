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
      assessment.addQuestion("prompt", "1", "mV");
      assessment.addQuestion("prompt", "3", null);
      
      
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
      assessment.addQuestion("Q1", "1", "mV");
      assessment.addQuestion("Q2", "3", null);
      assessment.addQuestion("Q3", "5", "V");
      
      
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
      
      // Table should be:
      /*
        Q1  | 1 mV  | 1 mV  | 1/1  | 
        Q2  | 2     | 3     | 0/1  | The value was wrong
        Q3  | 5 A   | 5V    | 0/1  | The units were wrong
      */  
      
      var tableData = table.find('td');
      
      tableData[0].innerHTML.should.be "Q1"
      tableData[1].innerHTML.should.be "1 mV"
      tableData[2].innerHTML.should.be "1 mV"
      tableData[3].innerHTML.should.be "1/1"
      tableData[4].innerHTML.should.be ""
      
      tableData[6].innerHTML.should.be "2"
      tableData[8].innerHTML.should.be "0/1"
      tableData[9].innerHTML.should.be "The value was wrong"
      
      tableData[14].innerHTML.should.be "The units were wrong"
      
    end
    
end
