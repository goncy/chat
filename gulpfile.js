var gulp            = require('gulp'),
    requireDir      = require('require-dir'),
    tasks           = requireDir('./gulp-data', {recurse: true}),
    runSequence     = require('run-sequence'),
    livereload      = require('gulp-livereload');

//Default
gulp.task('default', ["build"]);

//Clean
gulp.task('clean', ["clean:all"]);

//Copy
gulp.task('copy', function(cb){
  runSequence(
    "clean",
    ["copy:fonts", "copy:img", "copy:server"],
    cb);
});

//Build
gulp.task('build', function(cb){
  runSequence(
    ["clean", "copy"],
    ["build:html", "build:css", "build:js"],
    cb);
});

//Watch
gulp.task('watch', function () {
  livereload.listen();
  gulp.watch(['src/**/*.html'], ['build:html']);
  gulp.watch(['src/**/*.{css,scss}'], ['build:css']);
  gulp.watch(['src/**/*.{js,coffee}'], ['build:js']);
  gulp.watch(['src/**/*.{jpg,png}'], ['copy:img']);
  gulp.watch(['src/**/*.{php}'], ['copy:server']);
});
