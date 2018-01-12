const gulp = require('gulp');
const ejs = require('gulp-ejs');
const replace = require('gulp-replace');
const livereload = require('gulp-livereload');
const runsequence = require('run-sequence');

gulp.task('setup', ['preparePages', 'copy']);

gulp.task('copy', ['copyVendor', 'copyCSS', 'copyFonts', 'copyImages']);

gulp.task('preparePages', function () {
  gulp.src(['views/**/*.*'])
    .pipe(gulp.dest('./bin'))
    .pipe(livereload());
});

gulp.task('default', function() {
  return gulp.src('src/entry.js')
    .pipe(webpack())
    .pipe(gulp.dest('dist/'));
});

gulp.task('copyVendor', function () {
  gulp.src(['./vendor/**/*.*'])
  .pipe(gulp.dest('./bin/js/vendor'));
});

gulp.task('copyCSS', function () {
  gulp.src([]).pipe(gulp.dest('./bin/css')); // Add paths 1 at a time in the array (for vendors css)
});

// The Promises are needed for salesforce tasks. We need to wait until the copy is complete in order to bundle the staticresources
gulp.task('copyFonts', function () {
  return new Promise(function (resolve, reject) {
    gulp.src([]) // Add paths 1 at a time in the array (for vendors font)
    .on('error', reject)
    .pipe(gulp.dest('./bin/fonts'))
    .on('end', resolve);
  });
});

gulp.task('copyImages', function () {
  gulp.src(['./images/**/*.*'])
    .pipe(gulp.dest('./bin/images'));
});
