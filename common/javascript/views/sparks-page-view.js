/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.SparksPageView = function(page){
    this.page = page;
    this.$view = null;
    this.questionViews = {};
    this.controller = new sparks.SparksPageController();
  };
  
  sparks.SparksPageView.prototype = {
    
    getView: function() {
      var page = this.page;
      
      var self = this;
      
      var $pageDiv = $('<div>').addClass('page');

      var $questionDiv = $('<div>').addClass('inner-questions').css('float', 'left').css('padding', '10px');
      $pageDiv.append($questionDiv);

      $.each(page.questions, function(i, question){
        
        var $question = question.view.getView();
        var $form;
        
        if (!question.isSubQuestion){
          $form = $("<form>");
          $form.addClass("question_form");
          
          $form.append($question);
          
          $question.append($("<button>").addClass("submit").text("Submit").css('margin-left', '30px'));
          
          $questionDiv.append($form);
        } else {
          // find existing subquestion div if it exists, if not, create it
          var $subForms = $questionDiv.find('.sub'+question.subquestionId);
          if ($subForms.length > 0){
            $form = $($subForms[0]);
          } else {
            $form = $("<form>");
            $form.addClass("question_form");
            $form.addClass("sub"+question.subquestionId);

            $form.append($("<span>").addClass("prompt").html((question.shownId+1) + ".  " + question.commonPrompt));
            
            $form.append($("<div>").addClass("subquestions"));
            
            $form.append($("<button>").addClass("submit").text("Submit").css('align', 'right'));
            
            $questionDiv.append($form);
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
        var $notesDiv = $('<div>').addClass('notes').css('float','right');
        $notesDiv.html(page.notes);
        $pageDiv.append($notesDiv);
      }
      
      this.enableQuestion(page.currentQuestion);

      return $pageDiv;
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
    
    submitButtonClicked: function (event) {
      this.controller.nextQuestion(this.page);
    }
    
  };
})();