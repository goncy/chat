var
  gulp       = require('gulp'),
  argv       = require('yargs').default('env', 'local').argv,
  gulpif     = require('gulp-if'),
  htmlmin = require('gulp-htmlmin'),
  livereload = require('gulp-livereload');

gulp.task('build:html', function() {
  var app = gulp.src('./src/*.{html,nunjucks}')
    .pipe(gulpif(argv.env === "prod" || argv.env === "stg", htmlmin({collapseWhitespace: true, removeComments: true})))
    .pipe(gulp.dest('./dist/'));

  var pages = gulp.src('./src/pages/**/*.html')
    .pipe(gulpif(argv.env === "prod" || argv.env === "stg", htmlmin({collapseWhitespace: true, removeComments: true})))
    .pipe(gulp.dest('./dist/pages/'))
    .pipe(livereload());
});
