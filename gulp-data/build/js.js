var gulp = require('gulp');
    argv = require('yargs').default('env', 'local').argv,
    gulpif = require('gulp-if'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    source = require('vinyl-source-stream'),
    livereload = require('gulp-livereload'),
    es = require('event-stream');

var vendorFiles = [
  "./src/bower_components/angular/angular.js",
  "./src/bower_components/angular-route/angular-route.js",
  "./src/bower_components/angular-sanitize/angular-sanitize.js",
  "./src/bower_components/ng-file-upload/ng-file-upload.js",
  "./src/bower_components/ng-file-upload/ng-file-upload-shim.js",
  "./src/bower_components/pusher-angular/lib/pusher-angular.js",
  "./src/bower_components/bootstrap/dist/js/bootstrap.js",
  "./src/bower_components/fancyBox/source/jquery.fancybox.js",
  "./src/bower_components/PACE/pace.js"
];

gulp.task('build:js', function(){
  return es.concat(
    gulp.src(vendorFiles),
    gulp.src(['./src/pages/**/*.{js,coffee}','./src/app.js'])
  )
  .pipe(gulpif(argv.env === "prod" || argv.env === "stg", uglify()))
  .pipe(concat("chat.js"))
  .pipe(gulp.dest('./dist/js/'))
  .pipe(livereload());
});
