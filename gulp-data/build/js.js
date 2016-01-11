var
  gulp = require('gulp'),
  argv = require('yargs').default('env', 'local').argv,
  gulpif = require('gulp-if'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  mainBowerFiles = require('gulp-main-bower-files'),
  source = require('vinyl-source-stream'),
  angularFileSort = require('gulp-angular-filesort'),
  livereload = require('gulp-livereload'),
  filter = require('gulp-filter'),
  debug = require('gulp-debug'),
  order = require('gulp-order'),
  es = require('event-stream');

gulp.task('build:js', function () {
  var jsFilter = filter('**/*.js');
  var vendorFiles = gulp.src('./bower.json')
    .pipe(mainBowerFiles())
    .pipe(jsFilter)
    .pipe(concat('vendor.js'));

  var appFiles = gulp.src(['./src/pages/**/*.{js,coffee}', './src/app.js', './src/components/**/*.{js,coffee}'])
    .pipe(angularFileSort())
    .pipe(concat('app.js'));

  return es.concat(vendorFiles, appFiles)
    .pipe(order([
      "vendor.js",
      "app.js"
    ]))
    .pipe(gulpif(argv.env === "prod" || argv.env === "stg", uglify()))
    .pipe(concat("chat.js"))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(livereload());
});
