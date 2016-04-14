'use strict';

var gulp = require('gulp');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var del = require('del');
var DEST = 'dist/';

// Clean all files out of the dist folder
gulp.task('clean', function (cb) {
    del(['dist/**/*'], cb);
});

// Lint JavaScript files with jshint
gulp.task('lint', function() {
    return gulp.src('./scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('default', function() {
    return gulp.src('scripts/LocationListViewModel.js')
        // This will output the non-minified version
        .pipe(gulp.dest(DEST))
        // This will minify and rename to foo.min.js
        .pipe(uglify())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest(DEST));
});
