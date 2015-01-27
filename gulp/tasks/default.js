var gulp = require('gulp');
var config    = require('../config');

gulp.task('watch', function() {
    gulp.watch(config.app.src,  ['browserify']);
    gulp.watch(config.css.src,  ['minify-css']);
    gulp.watch(config.examples.src, ['copy-examples']);
});

gulp.task('build', ['copy-resources', 'copy-examples', 'browserify', 'minify-css']);

gulp.task('default', ['copy-resources', 'copy-examples', 'browserify', 'minify-css', 'watch']);
