var gulp       = require('gulp');
var bump       = require('gulp-bump');
var shell      = require('gulp-shell');
var browserify = require('browserify');
var through    = require('through');
var argv       = require('minimist')(process.argv.slice(2));
var Promise    = require('bluebird');
var path       = require('path');
var fs         = Promise.promisifyAll(require('fs'));

var externals      = ['events', 'buffer', 'lodash', 'bluebird', 'knex', 'backbone', 'trigger-then',
  'create-error', 'inflection', 'inherits', 'simple-extend', 'semver'];
var alwaysExcluded = [];

function ensureOutputDirectory() {
  return fs.mkdirAsync('./browser').catch(function(){});
}

function buildBookshelf() {
  var outfile = argv.o || 'bookshelf.js';
  var standalone = argv.s || 'Bookshelf';

  var b = browserify(['./bookshelf.js']);

  b.transform(function() {
    var data = '';
    function write (buf) { data += buf; }
    function end () {
      this.queue(data.replace("require('bluebird/js/main/promise')()", "require('bluebird')"));
      this.queue(null);
    }
    return through(write, end);
  });
  alwaysExcluded.forEach(function(file) {
    b.exclude(file);
  });
  externals.forEach(function(file) {
    b.external(file);
  });

  ensureOutputDirectory().then(function() {
    var outStream = fs.createWriteStream('./browser/' + outfile);
    b.bundle({standalone: standalone}).pipe(outStream);
  });
}

function buildDependencies() {
  var b = browserify();
  externals.forEach(function(ext) {
    ext === 'knex' ? b.require(path.join(__dirname, '/node_modules/knex/browser/knex.js'), {expose: 'knex'}) : b.require(ext);
  });
  ensureOutputDirectory().then(function() {
    var depStream = fs.createWriteStream('./browser/deps.js');
    b.bundle().pipe(depStream);
  });
}

gulp.task('build', function() {
  buildBookshelf();
  buildDependencies();
});
gulp.task('build:bookshelf', buildBookshelf);
gulp.task('build:deps', buildDependencies);

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
