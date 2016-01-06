var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    argv       = require('yargs').default('env', 'local').argv,
    imagemin = require('gulp-imagemin');

gulp.task('copy:img', function() {
    return gulp.src(['./src/assets/img/**', './src/favicon.ico'])
        .pipe(gulpif(argv.env === "prod" || argv.env === "stg", imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }]
        })))
        .pipe(gulp.dest('./dist/img/'));
});
