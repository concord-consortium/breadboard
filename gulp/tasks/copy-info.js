var gulp        = require('gulp');
var config      = require('../config');
var filesToMove = [
        './bower.json',
        './license.md',
        './package.json',
        './readme.md',
    ];

gulp.task('copy-info', function(){
  gulp.src(filesToMove, { base: './' })
    .pipe(gulp.dest(config.dest));
});
