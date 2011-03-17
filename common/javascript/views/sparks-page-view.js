/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.SparksPageView = function(page){
    this.page = page;
    
    this.$view = null;
    this.$questionDiv = null;
    this.$notesDiv = null;
    this.$reportsDiv = null;
    
    this.questionViews = {};
  };
  
  sparks.SparksPageView.prototype = {
    
    getView: function() {
      var page = this.page;
      
      var self = this;
      
      this.$view = $('<div>').addClass('page');

      this.$questionDiv = $('<div>').addClass('inner-questions').css('float', 'left').css('padding', '10px');
      this.$view.append(this.$questionDiv);

      $.each(page.questions, function(i, question){
        
        var $question = question.view.getView();
        var $form;
        
        if (!question.isSubQuestion){
          $form = $("<form>");
          $form.addClass("question_form");
          
          $form.append($question);
          
          $question.append($("<button>").addClass("submit").text("Submit").css('margin-left', '30px'));
          
          self.$questionDiv.append($form);
        } else {
          // find existing subquestion div if it exists, if not, create it
          var $subForms = self.$questionDiv.find('.sub'+question.subquestionId);
          if ($subForms.length > 0){
            $form = $($subForms[0]);
          } else {
            $form = $("<form>");
            $form.addClass("question_form");
            $form.addClass("sub"+question.subquestionId);

            $form.append($("<span>").addClass("prompt").html((question.shownId+1) + ".  " + question.commonPrompt));
            
            $form.append($("<div>").addClass("subquestions"));
            
            $form.append($("<button>").addClass("submit").text("Submit").css('align', 'right'));
            
            self.$questionDiv.append($form);
          }
          
          $form.find('.subquestions').append($question);
        }
        
        $form.find('.submit').unbind('click');          // remove any previously-added listeners
        $form.find('.submit').click(function (event) {
          event.preventDefault();
          self.submitButtonClicked(event);
        });
        
        self.questionViews[question.id] = $form;
      });

      if (!!page.notes){
        this.$notesDiv = $('<div>').addClass('notes').css('float','right');
        this.$notesDiv.html(page.notes);
        this.$view.append(this.$notesDiv);
      }
      
      this.enableQuestion(page.currentQuestion);

      return this.$view;
    },
    
    clear: function() {
      if (!!this.$questionDiv) {this.$questionDiv.html('');}
      if (!!this.$notesDiv) {this.$notesDiv.html('');}
      if (!!this.$reportsDiv) {this.$reportsDiv.html('');}
      if (!!this.$view) {this.$view.html('');}
    },
    
    enableQuestion: function (question) {
      var self = this;
      $.each(self.questionViews, function(questionKey, view){
        self.enableView(view, false);
      });
      self.enableView(self.questionViews[question.id], true);
    },
    
    enableView: function($view, enable) {
      $view.find('input, select, button').attr('disabled', !enable);
      $view.css("background-color", enable ? "rgb(253,255,184)" : "");
    },
    
    showReport: function($report, finalReport){
      
      this.$questionDiv.hide();
      if (!!this.$notesDiv) {this.$notesDiv.hide();}
      
      $('.report').html('');
      if (!!finalReport){
        $('#breadboard').html('');
      }
      this.$reportDiv = $('<div>').addClass('report').css('float', 'left').css('padding-top', '15px').css('padding-left', '40px');
      this.$reportDiv.append($report);
      
      // this should be handled by reports classes...
      var allCorrect = true;
      var notCorrectTables = $report.find('.notAllCorrect');
      if (notCorrectTables.length > 0 || $report.hasClass('notAllCorrect')){
        allCorrect = false;
      }
      
      var areMorePage = !!sparks.sparksActivityController.areMorePage();
      
      var comment = allCorrect ? "You got all the questions correct! "+(!finalReport ? (areMorePage ? "Move on to the next page." : "You can now view the Activity Summary") : "") :
                              "You can get a higher score these questions. " +
                              (!finalReport ? "You can repeat the page by clicking the <b>Repeat</b> button" +
                              (areMorePage ? ", or move on to the next page." : ", or view the Activity Summary") :
                              "You can repeat any page by clicking the <b>Try again</b> button under the table");
      this.$reportDiv.append($("<div>").html(comment).css('width', 700).css('padding-top', "20px"));
      
      var $buttonDiv = $("<div>").css("padding", "20px").css("text-align", "center");
      
      var $repeatButton = $("<button>").text("Repeat").css('padding-left', "10px")
                          .css('padding-right', "10px").css('margin-right', "10px");
      var $nextPageButton = $("<button>").text("Next Page »").css('padding-left', "10px")
                          .css('padding-right', "10px").css('margin-left', "10px");
      var $viewActivityReportButton = $("<button>").text("View your activity summary").css('padding-left', "10px")
                          .css('padding-right', "10px").css('margin-left', "10px");
                                              
      $repeatButton.click(function(evt){
        sparks.sparksActivityController.repeatPage();
      });

      $nextPageButton.click(function(evt){
        sparks.sparksActivityController.nextPage();
      });
      
      $viewActivityReportButton.click(function(evt){
        sparks.sparksActivityController.viewActivityReport();
      });
      
      if (!!sparks.sparksActivityController.areMorePage()){
        $buttonDiv.append($repeatButton, $nextPageButton);
      } else {
        $buttonDiv.append($repeatButton, $viewActivityReportButton);
      }
      if (!finalReport){
        this.$reportDiv.append($buttonDiv);
      }
      this.$view.append(this.$reportDiv);            
    },
    
    submitButtonClicked: function (event) {
      sparks.sparksPageController.completedQuestion(this.page);
    }
    
  };
})();