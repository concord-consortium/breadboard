/*globals console sparks $ breadModel getBreadBoard */

(function() {
  sparks.ActivityConstructor = function(jsonActivity, assessment){
    this.jsonActivity = jsonActivity;
    this.assessment = assessment;
    this.embeddingTargets = {
      $breadboardDiv: null,
      $imageDiv: null,
      $questionsDiv: null
    };
  };
  
  sparks.ActivityConstructor.prototype = {
    
    createAndLayoutActivity: function() {
      if (!!sparks.jsonActivity.circuit){
        this.createBreadboard();
      }
      this.createQuestions();
      this.layoutActivity();
    },
    
    // not usually necessary. Justs for tests?
    setEmbeddingTargets: function(targets) {
      if (!!targets.$breadboardDiv){
        this.embeddingTargets.$breadboardDiv = targets.$breadboardDiv;
      }
      if (!!targets.$imageDiv){
        this.embeddingTargets.$imageDiv = targets.$imageDiv;
      }
      if (!!targets.$questionsDiv){
        this.embeddingTargets.$questionsDiv = targets.$questionsDiv;
      }
    },
    
    
    /*
      Creates the breadboard from the JSON representation of the
      circuit. See tests/jspc/spec/spec.common/spec.circuit_constructor
      for examples of json circuits
    */
    createBreadboard: function() {
        
      if (!this.jsonActivity.circuit){
        return;
      }
      
      breadModel("createCircuit", this.jsonActivity.circuit);
    },
    
    /*
      Creates questions from the JSON represenation of the questions,
      and optionally embeds them in the jquery element provided
    */
    createQuestions: function(){
      if (!this.jsonActivity.questions){
        return;
      }
      
      var assessment = this.assessment;
      var self = this;
      var id = 0;
      
      /**
        This can be a little confusing.
        Each item in the array "questions" in an activity can be one of three things:
        
          1. A plain question, with one prompt
          2. A question with a prompt and multiple subquestions
          3. An array of questions, designed to be shown in a set.
          
        So we loop through the questions. If it's a plain question or a question with subquestions
        we call addQuestions on it. If it's an array (if it has length) we call addQuestions on 
        each element in the array.
        Then in addQuestions, if it's a plain question we call addSingleQuestion, and if it has 
        subquestions we call addSingleQuestion on each subquestion
      */
      
      function addQuestions(question){
        function addSingleQuestion(question, preprompt){
          question.correct_answer = self.calculateCorrectAnswer(question.correct_answer);
          var oldPrompt = question.prompt;
          if (!!preprompt){
            question.prompt = preprompt + " " + question.prompt;
          }
          if (!!question.multichoice){
            $.each(question.multichoice, function(i, choice){
              question.multichoice[i] = self.calculateCorrectAnswer(choice);
            });
          }
          assessment.addQuestion(question,id);
          id++;
          
          question.prompt = oldPrompt;
        }
        
        if (!question.subquestions){
          addSingleQuestion(question);
        } else {
          $.each(question.subquestions, function(i, subquestion){
            addSingleQuestion(subquestion, question.prompt);
          });
        }
      }
      
      $.each(this.jsonActivity.questions, function(i, question){
        if (!question.length){
          addQuestions(question);
        } else {
          $.each(question, function(i, innerQuestion){
            addQuestions(innerQuestion);
          });
        }
      });
    },
    
    /*
      When passed a string such as "[100 + ${r1.resistance} / ${r2.nominalResistance}] ohms"
      This will first take everything found in [...] and substitute in the calculated sum
    */
    calculateCorrectAnswer: function(answer){
      if (!isNaN(Number(answer))){
        return answer;
      }
      
      var self = this;
        
      var sumPattern = /\[[^\]]+\]/g  // find anything between [ ]
      var matches= answer.match(sumPattern);
      if (!!matches){      	
   	   $.each(matches, function(i, match){
    	  	var expression = match;
    	  	var result = self.calculateSum(expression);
    	  	answer = answer.replace(match,result);
    	  });
       }
      return answer;
    },
    
    
    /*
      When passed a string such as "100 + ${r1.resistance} / ${r2.nominalResistance}"
      this will first substitute the actual values of the variables in ${...}, assuming
      the components and their properties exist in the circuit, and then perform the
      calculation.
    */
   calculateSum: function(sum){
   	  var varPattern = /\${[^}]+}/g  //  ${ X } --> value of X
      var matches = sum.match(varPattern);
      if(!!matches){
       $.each(matches, function(i, match){
        var variable = match.substring(2,match.length-1).split('.');
        var component = variable[0];
        var property = variable[1];
        
        var components = getBreadBoard().components; 
        
        if (!components[component]){
          console.log("ERROR calculating sum: No component name '"+component+"' in circuit");
          sum = -1;
          return;
        }
        
        if (components[component][property] === undefined || components[component][property] === null){
          console.log("ERROR calculating sum: No property name '"+property+"' in component '"+component+"'");
          sum = -1;
          return;
        }
        
        var value = components[component][property];
        sum = sum.replace(match, value);
       });
      }
      
      var calculatedSum = eval(sum);
      if (!isNaN(Number(calculatedSum))){
        return calculatedSum;
      }
      
      console.log("ERROR calculating Sum: Cannot compute the value of "+sum);
      return -1;
   },

   layoutActivity: function() {
     if (!this.embeddingTargets.$imageDiv){
         this.embeddingTargets.$imageDiv = $('#image');
      }
     if (!this.embeddingTargets.$questionsDiv){
        this.embeddingTargets.$questionsDiv = $('#questions_area');
     }
     
     if (!!this.jsonActivity.image){
        $imagediv = $("<div>").addClass("question-image");
        $imagediv.append(
          $("<img>").attr('src', this.getImgSrc(this.jsonActivity.image))
        );
        this.embeddingTargets.$imageDiv.append($imagediv);
      }
      
     if (!!this.jsonActivity.questions){
       this.embedQuestions(this.embeddingTargets.$questionsDiv);
     }
   },
    
   embedQuestions: function ($questionsDiv){
      var questions = this.jsonActivity.questions;
      
      var self = this;
      
      if (!questions[0].length){  // nealing with a single group of questions
        this._embedGroupOfQuestions(questions, $questionsDiv);
      } else {                    // dealing with multiple pages of questions
        var questionPages = [];
        var nextButtons = [];
        $.each(questions, function(i, questionGroup){
          
          var $questionGroupDiv = $("<div>");
          self._embedGroupOfQuestions(questionGroup, $questionGroupDiv);
          
          $nextButton = $('<button>Next questions</button>').addClass("next-questions");
          $questionGroupDiv.append($nextButton);
          nextButtons.push($nextButton);
          
          $questionGroupDiv.hide();
          questionPages.push($questionGroupDiv);
          
          $questionsDiv.append($questionGroupDiv);
        });
        
        nextButtons[nextButtons.length-1].remove();
        questionPages[0].show();
        $.each(nextButtons, function(i, button){
          button.click(function(){
            questionPages[i].hide();
            questionPages[i+1].show();
          });
        });
      }
      
    },
    
    question_id: 0,
    
    // Embeds a single set of questions, for displaying on one page
    _embedGroupOfQuestions: function (questionGroup, $question_div) {
      var self = this;
      
      $.each(questionGroup, function(i, question){
        var $form = $("<form>");
        $form.addClass("question_form");

        if (!!question.image){
          $div = $("<div>").addClass("question-image");
          $div.append(
            $("<img>").attr('src', self.getImgSrc(question.image))
          );
          $form.append($div);
        }

        $form.append(
          $("<span>").addClass("prompt").html((self.question_id+1) + ".  " + question.prompt), "   "
        );

        function addInputs($html, question){
          if (!question.multichoice){
            $html.append(
              $("<input>").attr("id",self.question_id+"_input"), "   "
            );
          } else {
            if (!!question.checkbox || !!question.radio){
              $.each(question.multichoice, function(i,answer_option){
                answer_option = self.calculateCorrectAnswer(answer_option);
                //reformat units
                answer_option = answer_option.replace("ohms","&#x2126;"); //reformat "ohm" to the letter omega
                answer_option = answer_option.replace("micro","&#x00b5;"); //reformat "micro" to greek letter mu

                var type = question.checkbox ? "checkbox" : "radio";
                var groupName = type + "Group" + self.question_id;
                $html.append($("<br>"));
                $html.append($("<input>").attr("type", type).attr("name", groupName).attr("value", answer_option));	
                $html.append("<span> " + answer_option + "</span>");
              });
              $html.append('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
            } else {
              var $select = $("<select>").attr("id",self.question_id+"_multichoice");

              $.each(question.multichoice, function(i,answer_option){
                answer_option = self.calculateCorrectAnswer(answer_option);
                //reformat units
                answer_option = answer_option.replace("ohms","&#x2126;"); //reformat "ohm" to the letter omega
                answer_option = answer_option.replace("micro","&#x00b5;"); //reformat "micro" to greek letter mu

                $select.append($("<option>").html(answer_option).attr("defaultSelected",i===0));	
              });
              $html.append($select, "   ");
            }
          }

          if (!!question.correct_units){
             var $unitsSelect = $("<select>").attr("id", self.question_id+"_units");
             var options = ["Units...","&#x00b5;V","mV","V","&#x2126;","k&#x2126;","M&#x2126;","&#x00b5;A","mA","A"];
             $.each(options, function(i, val){
               $unitsSelect.append($("<option>").html(val).attr("defaultSelected", i===0));
             });
             $html.append($unitsSelect, "   ");
          }


          $html.append(
            $("<br>")
          );
          self.question_id++;
        }

        if (!question.subquestions){
          addInputs($form, question);
        } else {

          $form.append(
            $('<br>')
          );

          var $subquestionDiv = $('<div>').attr('style', 'margin-left: 20px; margin-top: 10px');

          $.each(question.subquestions, function(i, question){
            $subquestionDiv.append(
              $("<span>").addClass("prompt").html(question.prompt), "   "
            );
            addInputs($subquestionDiv, question);
          });

          $form.append($subquestionDiv);
        }

        $form.find('br:last').replaceWith( 
          $("<button>").addClass("submit").text("Submit")
        );

        $question_div.append($form);
      });
    },
    
    getImgSrc: function(fileName) {
      if (fileName.indexOf("http") > -1){
        return fileName;
      } else if (!!this.jsonActivity.images_url) {
        return this.jsonActivity.images_url + "/" + fileName;
      }
      console.log(fileName + " appears to be a relative filename, but there is no base activity url.");
      return "";
    }
  };
})();