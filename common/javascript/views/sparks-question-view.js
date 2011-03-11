/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.SparksQuestionView = function(question){
    this.question = question;
    this.$view = null;
  };
  
  sparks.SparksQuestionView.prototype = {
    
    getView: function() {
      var question = this.question;
      
      var $question = $("<div>").addClass("question");

      if (!!question.image){
        var $div = $("<div>").addClass("question-image");
        $div.append(
          $("<img>").attr('src', this._getImgSrc(question.image))
        );
        $question.append($div);
      }
      
      var prompt = question.isSubQuestion ? question.prompt : (question.shownId+1) + ".  " + question.prompt;

      $question.append(
        $("<span>").addClass("prompt").html(prompt), "   "
      );

      var self = this;
      
      if (!question.options){
        var $input = $("<input>").attr("id",question.id+"_input");
        $question.append($input);
        $input.change(function(args){
          self.valueChanged(args);
        });
      } else {
        
        if (!question.keepOrder){
          question.options = sparks.util.shuffle(question.options);
        }
        
        if (!!question.checkbox || !!question.radio){
          $.each(question.options, function(i,answer_option){
            if (!answer_option.option){
              // answer_option = sparks.mathParser.calculateMeasurement(answer_option);
            } else {
              // answer_option = sparks.mathParser.calculateMeasurement(answer_option.option);
              answer_option = answer_option.option;
            }
            
            var type = question.checkbox ? "checkbox" : "radio";
            
            var groupName = type + "Group" + question.id;
            
            $question.append($("<br>"));
            var $input = $("<input>").attr("type", type).attr("name", groupName).attr("value", answer_option);
            $question.append($input);	
            $question.append("<span> " + answer_option + "</span>");
            
            $input.change(function(args){
              self.valueChanged(args);
            });
          });
          $question.append('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
        } else {
          var $select = $("<select>").attr("id",question.id+"_options");
          
          $select.append($("<option>").attr("value", "").html("").attr("defaultSelected",true));
           
          $.each(question.options, function(i,answer_option){
            if (!answer_option.option){
              answer_option = sparks.mathParser.calculateMeasurement(answer_option);
            } else {
              answer_option = sparks.mathParser.calculateMeasurement(answer_option.option);
            }
            $select.append($("<option>").attr("value", answer_option).html(answer_option).attr("defaultSelected",false));	
          });
          $question.append($select, "   ");
          $select.change(function(args){
            self.valueChanged(args);
          });
        }
      }

      if (!!question.correct_units){
         var $unitsSelect = $("<select>").attr("id", question.id+"_units");
         var options = ["Units...","&#x00b5;V","mV","V","&#x2126;","k&#x2126;","M&#x2126;","&#x00b5;A","mA","A"];
         $.each(options, function(i, val){
           $unitsSelect.append($("<option>").html(val).attr("defaultSelected", i===0));
         });
         $question.append($unitsSelect, "   ");
      }

      return $question;
    },
    
    _getImgSrc: function(fileName) {
      if (fileName.indexOf("http") > -1){
        return fileName;
      } else if (!!this.jsonActivity.images_url) {
        return this.jsonActivity.images_url + "/" + fileName;
      }
      console.log(fileName + " appears to be a relative filename, but there is no base activity url.");
      return "";
    },
    
    valueChanged: function(args) {
      var value = $(args.target).val();
      this.question.answer = value;
    }
    
  };
  
})();
  