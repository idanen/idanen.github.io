'use strict';

const path = require('path');
const karmaConf = require('../karma.config.js');

// karmaConf.files get populated in karmaFiles
karmaConf.files = [];

module.exports = function (gulp, $, config) {
  gulp.task('clean:test', function (cb) {
    return $.del(config.buildTestDir, cb);
  });

  gulp.task('buildTests', ['clean:test'], function () {
    return gulp.src([config.unitTestFiles])
      .pipe(gulp.dest(config.buildUnitTestsDir));
  });

  // inject scripts in karma.config.js
  gulp.task('karmaFiles', function () {
    var stream = $.streamqueue({objectMode: true});

    // add bower javascript
    stream.queue(gulp.src($.wiredep({
      devDependencies: true,
      exclude: [/polymer/, /webcomponents/]
    }).js));

    // add application templates
    stream.queue(gulp.src([config.buildTestDirectiveTemplateFiles]));

    // add application javascript
    stream.queue(
        gulp.src([
          'test/module.mock.js',
          config.appScriptFiles,
          '!**/webcomponents*.js',
          '!**/runtime-caching.js',
          '!**/notifications-sw.js',
          '!**/sw-toolbox.js',
          '!**/service-worker.js',
          '!**/*.test.*'
        ])
          .pipe($.babel({
              presets: ['es2015']
          }))
          .pipe($.angularFilesort())
    );

    // add unit tests
    stream.queue(gulp.src([config.unitTestFiles]));

    // add templates
    stream.queue(gulp.src(['app/scripts/**/*.html']));

    return stream.done()
      .on('data', function (file) {
        karmaConf.files.push(file.path);
      });
  });

  // run unit tests
  gulp.task('unitTest', ['karmaFiles'], function (done) {
    var server = new $.karma.Server(karmaConf, function () {
      done();
    });
    server.start();
  });

  gulp.task('justTest', ['karmaFiles'], function (done) {
    var server = new $.karma.Server(karmaConf, function () {
      done();
    });
    server.start();
  });

  gulp.task('build:e2eTest', function () {
    return gulp.src([config.e2eFiles])
      .pipe(gulp.dest(config.buildE2eTestsDir));
  });

  // run e2e tests - SERVER MUST BE RUNNING FIRST
  gulp.task('e2eTest', ['lint', 'build:e2eTest'], function () {
    return gulp.src(config.buildE2eTests)
      .pipe($.protractor.protractor({
        configFile: 'protractor.config.js'
      }))
      .on('error', function (e) {
        console.log(e);
      });
  });

  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
  /* jshint -W106 */
  gulp.task('webdriverUpdate', $.protractor.webdriver_update);
  /* jshint +W106 */
  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
};
