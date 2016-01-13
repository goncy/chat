var
  gulp       = require('gulp'),
  sass       = require('gulp-sass'),
  concat     = require('gulp-concat'),
  nano       = require('gulp-cssnano'),
  gulpif     = require('gulp-if'),
  argv       = require('yargs').default('env', 'local').argv,
  livereload = require('gulp-livereload'),
  es         = require('event-stream');

var vendorFilesCss = [
  "./src/bower_components/fancyBox/source/jquery.fancybox.css",
  "./src/bower_components/PACE/themes/green/pace-theme-minimal.css",
  "./src/bower_components/angular-toasty/dist/angular-toasty.css"
];

gulp.task('build:css', function () {
  return es.concat(
      gulp.src(vendorFilesCss),
      gulp.src(['./src/pages/**/*.{css,scss}', './src/app.css'])
    )
    .pipe(sass())
    .pipe(concat('chat.css'))
    .pipe(gulpif(argv.env === "prod" || argv.env === "stg", nano()))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(livereload());
});
