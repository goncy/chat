var gulp      = require('gulp'),
    sass      = require('gulp-sass'),
    concat = require('gulp-concat'),
    minifyCss = require('gulp-cssnano'),
    gulpif = require('gulp-if'),
    argv = require('yargs').default('env', 'local').argv,
    livereload      = require('gulp-livereload');

gulp.task('build:css', function() {
  return gulp.src('./src/{sass,css}/**/*.{scss,css}')
    .pipe(sass())
    .pipe(concat('etermax.css'))
    .pipe(gulpif(argv.env === "prod" || argv.env === "stg", minifyCss()))
    .pipe(gulp.dest('./dist/css/'))
    .pipe(livereload());
});
