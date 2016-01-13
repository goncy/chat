var gulp = require('gulp'),
    gulpif = require('gulp-if'),
    argv       = require('yargs').default('env', 'local').argv,
    imagemin = require('gulp-imagemin');

gulp.task('copy:img', function() {
    var images = gulp.src(['./src/favicon.ico','!./src/assets/img/fancybox','./src/assets/img/*'])
        .pipe(gulpif(argv.env === "prod" || argv.env === "stg", imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }]
        })))
        .pipe(gulp.dest('./dist/img/'));

    var fancybox = gulp.src(['./src/assets/img/fancybox/**'])
        .pipe(gulpif(argv.env === "prod" || argv.env === "stg", imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }]
        })))
        .pipe(gulp.dest('./dist/css/'));
});
