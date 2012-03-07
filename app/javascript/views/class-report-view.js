/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.ClassReportView = function(){
    this.$wrapperDiv = null;
    this.$classReport = null;
  };
  
  sparks.ClassReportView.prototype = {
    
    getClassReportView: function(reports){
      var $div = $('<div>');
      
      $div.append('<h1>Class results</h1>');
      $div.append('<span id="date">' + sparks.util.todaysDate() + "</span>");
      $div.append(this.createLevelsTable(reports));
      $div.append('<p>');
      
      $div.append('<h2>Question categories</h2>');
      $div.append(this.createCategoryTable(reports));
      
      $div.find('.tablesorter').tablesorter(
        {
          sortList: [[0,0]], 
          widgets: ['zebra'],
          textExtraction: function(node) {      // convert image to a string so we can sort on it
            var content = node.childNodes[0];
            if (!content) {
              return "A";
            } else if (content.nodeName === "IMG") {
              return "Z"+(content.getAttribute('score'));
            } else {
              return content.textContent;
            }
          }
        });
      
      this.$classReport = $div;
      
      this.$wrapperDiv = $("<div>").append(this.$classReport);
      
      return this.$wrapperDiv;
    },
    
    createLevelsTable: function(reports) {
      var $table = $("<table>").addClass('classReport').addClass('tablesorter');
      var levels = sparks.classReportController.getLevels();
      
      var headerRow = "<thead><tr><th class='firstcol'>Student Name</th>";
      for (var i = 0, ii = levels.length; i < ii; i++){
        headerRow += "<th>" + levels[i] + "</th>";
      }
      headerRow += "<th class='lastcol'>Cumulative Points</th></tr></thead>";
      $table.append(headerRow);
      
      for (i = 0, ii = reports.length; i < ii; i++){
        var $studentRow = this._createStudentRow(reports[i], levels.length);
        $table.append($studentRow);
      }
      return $table;
    },
    
    _createStudentRow: function(report, numLevels) {
      var $tr = $("<tr>"),
          name = this._cleanStudentName(report.user.name),
          totalScore = 0;
      
      var $name = $("<td class='firstcol'>" + name + "</td>");
      $tr.append($name);
      var self = this;
      $name.click(function(){self.showStudentReport(report);});
      for (var i = 0, ii = report.sectionReports.length; i < ii; i++){
        var summary = sparks.reportController.getSummaryForSectionReport(report.sectionReports[i]),
            light;
        totalScore += summary[1];
        
        if (summary[0] < 0.30){
          light = "common/icons/light-red.png";
        } else if (summary[0] < 0.90) {  
          light = "common/icons/light-off.png";
        } else {  
          light = "common/icons/light-on.png";
        }
        var $img = $('<img>').attr('src', light).attr('width', 35).attr('score', summary[0]);
        $img.easyTooltip({
           content: name + " scored "+sparks.math.roundToSigDigits(summary[0]*100,3)+"% of the possible points from the last "+summary[2]+" times they ran this level"
        });
        $tr.append($('<td>').append($img));
      }
      
      for (i = 0, ii = numLevels - report.sectionReports.length; i < ii; i++){
        $tr.append("<td/>");
      }
      
      $tr.append("<td class='lastcol'>"+totalScore+"</td>");
      return $tr;
    },
    
    _cleanStudentName: function (name) {
      if (name.indexOf('+') > -1){
        return name.split("+").join(" ");
      }
      return name;
    },
    
    createCategoryTable: function(reports) {
      var $table = $("<table>").addClass('classReport').addClass('tablesorter'),
          categories = [],
          i, ii;
      for (i = 0, ii = reports.length; i < ii; i++){
        var row = [],
            report = reports[i],
            name = this._cleanStudentName(report.user.name),
            catReport = sparks.reportController.getCategories(report);
        
        // get category report for this student, populate category array
        for (var category in catReport){
          if (!!category && category !== "undefined" && catReport.hasOwnProperty(category)){
            var catIndex = sparks.util.contains(categories, category);
            if (catIndex < 0){
              categories.push(category);
              catIndex = categories.length - 1;
            }
            row[catIndex] = catReport[category];
          }
        }
        
        // create TR for this student
        var $tr = $('<tr>').addClass(i%2===0 ? "evenrow" : "oddrow");
        $tr.append('<td class="firstcol">'+name+'</td>');
        for (var j = 0, jj = categories.length; j < jj; j++){
          var score = row[j],
              $td = $('<td>');
          if (!!score){
            var light;
            switch (score[2]) {
              case 0:
                light = "common/icons/light-red.png";
                break;
              case 1:
              case 2:
               light = "common/icons/light-off.png";
               break;
              case 3:
               light = "common/icons/light-on.png";
            }
            var $img = $('<img>').attr('src', light).attr('width', 35).attr('score', score[2]);
            $img.easyTooltip({
               content: name+" got "+score[2]+" out of the last "+(Math.min(score[1],3))+" questions of this type correct"
            });
            $td.append($img);
          }
          $tr.append($td);
        }  
        $table.append($tr);
      }
      
      // create headers now that we know all the categories
      var header = "<thead><tr><th>Students</th>";
      for (i = 0, ii = categories.length; i < ii; i++){
        header += "<th>" + categories[i] + "</th>";
      }
      header += "</tr></thead>";
      $table.prepend(header);
      
      // finally, fill up all the rows (they may have been created with diff # of categories)
      $table.find('tr').each(function(i, tr){
        for (j = categories.length, jj = tr.childNodes.length; j >= jj; j--){
          $(tr).append('<td>');
        }
      });
      
      return $table;
    },
    
    showStudentReport: function(report) {
      var $div = $("<div>");
      
      var $returnButton = $("<button>").text("Return to class report").css('padding-left', "10px")
                        .css('padding-right', "10px").css('margin-left', "20px");
      var self = this;
      $returnButton.click(function(){
        $div.hide();
        self.$classReport.show();
      });
      $div.append($returnButton);
      
      $div.append("<h1>"+this._cleanStudentName(report.user.name)+"</h1>");
      $div.append(this.createStudentReport(report));
      
      this.$classReport.hide();
      this.$wrapperDiv.append($div);
    },
    
    createStudentReport: function(report) {
      var $table = $("<table>").addClass('classReport').addClass('tablesorter');
      var levels = sparks.classReportController.getLevels();
      
      var headerRow = "<thead><tr><th class='firstcol'>Level</th><th>Score per Attempt (%)</th><th>Total score</th></tr></thead>";
      $table.append(headerRow);
      for (var i = 0, ii = levels.length; i < ii; i++){
        var level = levels[i];
        var $tr = $("<tr>").addClass(i%2===0 ? "even":"odd");
        $tr.append("<td class='firstcol'>"+levels[i]+"</td>");
        
        var $graphTD = $("<td>");//.css('width', '10em').css('overflow-x', 'scroll').css('overflow-y','hidden');
        var $graph = $('<ul class="timeline">');
        var data = sparks.reportController.getSessionScoresAsPercentages(report.sectionReports[i]);
        for (j = 0, jj = data.length; j < jj; j++) {
          var $li = $('<li><a><span class="count" style="height: '+data[j]+'%"></a></li>');
          $li.easyTooltip({
             content: ""+sparks.math.roundToSigDigits(data[j],3)+"% of the possible points in attempt "+(j+1)
          });
          $graph.append($li);
        }
        $tr.append($graphTD.append($graph));
        
        var score = "";
        if (i < report.sectionReports.length){
          score = sparks.reportController.getTotalScoreForSectionReport(report.sectionReports[i]);
        }
        $tr.append("<td>"+score+"</td>");
        $table.append($tr);
      }
      return $table;
    }
  };
})();