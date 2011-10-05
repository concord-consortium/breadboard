/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.SectionView = function(section){
    this.section = section;
  };
  
  sparks.SectionView.prototype = {
    
    clear: function() {
      $('#breadboard').html('');
      $('#image').html('');
      sparks.sectionController.currentPage.view.clear();
    },
    
    getImageView: function() {
      var $imagediv = $("<div>").addClass("question-image");
      $imagediv.append(
        $("<img>").attr('src', this.getImgSrc(this.section.image))
      );
      return $imagediv;
    },
    
    getImgSrc: function(fileName) {
      if (fileName.indexOf("http") > -1){
        return fileName;
      } else if (!!this.section.images_url) {
        return this.section.images_url + "/" + fileName;
      }
      console.log(fileName + " appears to be a relative filename, but there is no base activity url.");
      return "";
    }
    
  };
})();