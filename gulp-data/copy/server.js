var gulp 	= require('gulp'),
	gulpif  = require('gulp-if'),
	argv    = require('yargs').default('env', 'local').argv,
	htmlmin = require('gulp-htmlmin');

gulp.task('copy:server', function() {
    var sv = gulp.src('./src/server/**')
        .pipe(gulp.dest('./dist/server'));

    var uploads = gulp.src('./src/uploads/')
        .pipe(gulp.dest('./dist'));

    var uploads = gulp.src('./src/admin/**')
    	.pipe(gulpif(argv.env === "prod" || argv.env === "stg", htmlmin({collapseWhitespace: true})))
        .pipe(gulp.dest('./dist/admin'));
});
