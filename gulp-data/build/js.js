var gulp = require('gulp');
    argv = require('yargs').default('env', 'local').argv,
    gulpif = require('gulp-if')
    uglify = require('gulp-uglify'),
    livereload      = require('gulp-livereload');

gulp.task('build:js', function(){
  return gulp.src('./src/js/**/*.{js,coffee}')
    .pipe(gulpif(argv.env === "prod" || argv.env === "stg", uglify()))
    .pipe(gulp.dest('./dist/js/'))
    .pipe(livereload());
});
