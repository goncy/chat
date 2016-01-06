var gulp = require('gulp');

gulp.task('copy:server', function() {
    var sv = gulp.src('./src/server/**')
        .pipe(gulp.dest('./dist/server'));

    var uploads = gulp.src('./src/uploads/')
        .pipe(gulp.dest('./dist'));
});
