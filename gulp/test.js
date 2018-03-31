'use strict';

const webpack = require('webpack');
const karmaConf = require('../karma.config.js');

// karmaConf.files get populated in karmaFiles
karmaConf.files = [];

module.exports = function (gulp, $, config) {
  gulp.task('clean:test', function (cb) {
    return $.del(config.buildTestDir, cb);
  });

  gulp.task('vendorsForTests', ['clean:test'], function () {
    console.log('building lib.bundle.js');
    const webpackConf = require('../webpack.config');
    webpackConf.entry.lib = './app/index.test.js';
    return gulp.src('app/index.test.js')
      .pipe($.webpack(webpackConf, webpack))
      .pipe(gulp.dest(`${config.buildUnitTestsDir}/packed`))
  });

  gulp.task('buildTests', ['vendorsForTests'], function () {
    return gulp.src([
      config.unitTestFiles,
      `!${config.appDir}/**/index*.js`
    ])
      .pipe(gulp.dest(config.buildUnitTestsDir));
  });

  // inject scripts in karma.config.js
  gulp.task('karmaFiles', ['buildTests'], function () {
    var stream = $.streamqueue({objectMode: true});

    // add application templates
    stream.queue(gulp.src([config.buildTestDirectiveTemplateFiles]));

    // add application javascript
    stream.queue(
        gulp.src([
          `${config.buildUnitTestsDir}/packed/**`,
          'test/module.mock.js',
          config.appScriptFiles,
          `!${config.appDir}/**/index*.js`,
          '!**/webcomponents*.js',
          '!**/runtime-caching.js',
          '!**/notifications-sw.js',
          '!**/sw-toolbox.js',
          '!**/service-worker.js',
          '!**/*.test.*'
        ])
          .pipe($.babel({
              presets: [
                ['env', {
                  targets: {
                    browsers: 'last 2 versions'
                  }
                }]
              ]
          }))
    );

    // add unit tests
    stream.queue(gulp.src([
      config.unitTestFiles,
      `!${config.appDir}/**/index*.js`
    ]));

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
