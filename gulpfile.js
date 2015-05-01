var gulp       = require('gulp');
var bump       = require('gulp-bump');
var shell      = require('gulp-shell');
var browserify = require('browserify');
var through    = require('through');
var argv       = require('minimist')(process.argv.slice(2));
var Promise    = require('bluebird');
var path       = require('path');
var fs         = Promise.promisifyAll(require('fs'));

function ensureOutputDirectory() {
  return fs.mkdirAsync('./browser').catch(function(){});
}

gulp.task('build', function buildBookshelf() {
  var outfile = argv.o || 'bookshelf.js';
  var standalone = argv.s || 'Bookshelf';
  var b = browserify({standalone: standalone}).add('./bookshelf.js');
  ensureOutputDirectory().then(function() {
    var outStream = fs.createWriteStream('./browser/' + outfile);
    b.bundle().pipe(outStream);
  });
});

// Run the test... TODO: split these out to individual components.
gulp.task('jshint', shell.task(['npm run jshint']));
gulp.task('test', ['jshint'], shell.task(['npm run test']));

gulp.task('bump', function() {
  var type = argv.type || 'patch';
  return gulp.src('./package.json')
    .pipe(bump({type: type}))
    .pipe(gulp.dest('./'));
});
gulp.task('release', function() {
  return fs.readFileAsync('./package.json')
    .bind(JSON)
    .then(JSON.parse)
    .then(function(json) {
      return shell.task([
        'git add -u',
        'git commit -m "release ' + json.version + '"',
        'git tag ' + json.version,
        'npm publish',
        'git push',
        'git push --tags',
        'git checkout gh-pages',
        'git merge master',
        'git push',
        'git checkout master'
      ])();
    });
});
