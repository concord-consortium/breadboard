var gulp        = require('gulp');
var config      = require('../config').resources;

gulp.task('copy-common', function(){
  gulp.src(config.common, { base: './' })
    .pipe(gulp.dest(config.commonDest));
});

gulp.task('copy-jquery-ui-images', function(){
  gulp.src(config.jqueryUI, { base: config.jqueryUIBase })
    .pipe(gulp.dest(config.jqueryDest));
});

gulp.task('copy-resources', ['copy-common', 'copy-jquery-ui-images']);
