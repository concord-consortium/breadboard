/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.ClassReportView = function(){
  };
  
  sparks.ClassReportView.prototype = {
    
    getClassReportView: function(reports){
      var $div = $('<div>');
      
      $div.append('<h1>Class results</h1>');
      $div.append(this.createLevelsTable(reports));
      $div.append('<p>');
      
      $div.append('<h2>Question categories</h2>');
      $div.append(this.createCategoryTable(reports));
      
      return $div;
    },
    
    createLevelsTable: function(reports) {
      var $table = $("<table>").addClass('classReport');
      var levels = sparks.classReportController.getLevels();
      
      var headerRow = "<tr><th class='firstcol'>Student Name</th>";
      for (var i = 0, ii = levels.length; i < ii; i++){
        headerRow += "<th>" + levels[i] + "</th>";
      }
      headerRow += "<th class='lastcol'>Cumulative Points</th></tr>";
      $table.append(headerRow);
      
      for (i = 0, ii = reports.length; i < ii; i++){
        var $studentRow = this._createStudentRow(reports[i], levels.length, i%2 === 0);
        $table.append($studentRow);
      }
      return $table;
    },
    
    _createStudentRow: function(report, numLevels, even) {
      var $tr = $("<tr class='" + (even ? "evenrow'>" : "oddrow'>")),
          name = this._cleanStudentName(report.user.name),
          totalScore = 0;
      $tr.append("<td class='firstcol'>" + name + "</td>");
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
        var $img = $('<img>').attr('src', light).attr('width', 35);
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
      var $table = $("<table>").addClass('classReport'),
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
            var $img = $('<img>').attr('src', light).attr('width', 35);
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
      var header = "<tr><th>Students</th>";
      for (i = 0, ii = categories.length; i < ii; i++){
        header += "<th>" + categories[i] + "</th>";
      }
      header += "</tr>";
      $table.prepend(header);
      
      // finally, fill up all the rows (they may have been created with diff # of categories)
      $table.find('tr').each(function(i, tr){
        for (j = categories.length, jj = tr.childNodes.length; j >= jj; j--){
          console.log("adding a td to row "+i);
          $(tr).append('<td>');
        }
      });
      
      return $table;
    }
    
  };
})();