var gulp      = require('gulp');
var concat    = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var config    = require('../config').css;

gulp.task('minify-css', function() {
  gulp.src(config.src)
    .pipe(concat('breadboard.css'))
    .pipe(minifyCSS({keepBreaks:true}))
    .pipe(gulp.dest(config.dest))
});
