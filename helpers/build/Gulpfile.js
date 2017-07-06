var gulp = require('gulp');
var postcss = require('gulp-postcss');

gulp.task('default', function () {
    return gulp.src('../sass/basic.sass')
        .pipe(postcss([], {
            parser: require('../../.'),
            stringifier: require('../../stringify')
        }))
        .pipe(gulp.dest('./result'));
});
