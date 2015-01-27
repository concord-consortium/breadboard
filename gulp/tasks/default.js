var gulp = require('gulp');
var config    = require('../config');

gulp.task('watch', function() {
    gulp.watch(config.app.src,  ['browserify']);
    gulp.watch(config.css.src,  ['minify-css']);
    gulp.watch(config.examples.src, ['copy-examples']);
});

gulp.task('build', ['copy-resources', 'browserify', 'minify-css']);

gulp.task('build-gh-pages', ['build', 'copy-examples', 'copy-info']);
gulp.task('build-production', ['build', 'copy-info']);

gulp.task('default', ['build', 'copy-examples', 'watch']);
