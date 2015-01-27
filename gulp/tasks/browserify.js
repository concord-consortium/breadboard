var gulp        = require('gulp');
var browserify  = require('browserify');
var transform   = require('vinyl-transform');
var rename      = require('gulp-rename');
var config      = require('../config').app;

gulp.task('browserify', function () {
  var browserified = transform(function(filename) {
    var b = browserify({entries: filename, standalone: "sparks"});
    return b.bundle();
  });

  return gulp.src([config.init])
    .pipe(browserified)
    .pipe(rename('sparks.js'))
    .pipe(gulp.dest(config.dest));
});
