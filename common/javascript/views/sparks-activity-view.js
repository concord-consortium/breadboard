/*globals console sparks $ breadModel getBreadBoard */

(function() {
  
  sparks.SparksActivityView = function(activity){
    this.activity = activity;
  };
  
  sparks.SparksActivityView.prototype = {
    
    getImageView: function() {
      var $imagediv = $("<div>").addClass("question-image");
      $imagediv.append(
        $("<img>").attr('src', this.getImgSrc(this.activity.image))
      );
      return $imagediv;
    },
    
    getImgSrc: function(fileName) {
      if (fileName.indexOf("http") > -1){
        return fileName;
      } else if (!!this.activity.images_url) {
        return this.activity.images_url + "/" + fileName;
      }
      console.log(fileName + " appears to be a relative filename, but there is no base activity url.");
      return "";
    }
    
  };
})();