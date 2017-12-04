'use strict';

const webpack = require('webpack');
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
    // stream.queue(gulp.src($.wiredep({
    //   devDependencies: true,
    //   exclude: [/polymer/, /webcomponents/]
    // }).js));
    stream.queue(gulp.src('app/index.js')
      .pipe($.webpack(require('../webpack.config'), webpack))
      .pipe(gulp.dest(`${config.extDir}packed`))
    );

    // add application templates
    stream.queue(gulp.src([config.buildTestDirectiveTemplateFiles]));

    // add application javascript
    stream.queue(
        gulp.src([
          'test/module.mock.js',
          config.appScriptFiles,
          `!${config.appDir}/**/index.js`,
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
  gulp.task('unitTest', ['karmaFiles'], function () {
    new $.karma.Server(karmaConf).start();
  });
};
