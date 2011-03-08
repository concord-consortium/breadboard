/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.SparksPageView = function(page){
    this.page = page;
    this.$view = null;
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
        
        if (!question.isSubQuestion){
          var $form = $("<form>");
          $form.addClass("question_form");
          
          $form.append($question);
          
          $question.append($("<button>").addClass("submit").text("Submit").css('margin-left', '30px'));
          
          $questionDiv.append($form);
        } else {
          // find existing subquestion div if it exists, if not, create it
          var $subForms = $questionDiv.find('.sub'+question.subquestionId);
          var $subForm;
          if ($subForms.length > 0){
            $subForm = $($subForms[0]);
          } else {
            $subForm = $("<form>");
            $subForm.addClass("question_form");
            $subForm.addClass("sub"+question.subquestionId);

            $subForm.append($("<span>").addClass("prompt").html((question.shownId+1) + ".  " + question.commonPrompt));
            
            $subForm.append($("<div>").addClass("subquestions"));
            
            $subForm.append($("<button>").addClass("submit").text("Submit").css('align', 'right'));
            
            $questionDiv.append($subForm);
          }
          
          $subForm.find('.subquestions').append($question);
          
          $subForm.find('.submit').click(function (event) {
            self.submitButtonClicked(event);
            event.preventDefault();
          });
        }
      });

      if (!!page.notes){
        var $notesDiv = $('<div>').addClass('notes').css('float','right');
        $notesDiv.html(page.notes);
        $pageDiv.append($notesDiv);
      }


      return $pageDiv;
    },
    
    submitButtonClicked: function (event) {
      console.log("Submit!");
    }
    
  };
})();