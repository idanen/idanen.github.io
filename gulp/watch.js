'use strict';
var historyApiFallback = require('connect-history-api-fallback');

module.exports = function (gulp, $, config) {
  gulp.task('browserSync', function () {
    $.browserSync({
      host: config.host,
      open: 'external',
      port: config.port,
      server: {
        baseDir: config.buildDir,
        middleware: [historyApiFallback()]
      }
    });
  });

  gulp.task('watch', function () {
    $.browserSync.reload();
    gulp.watch([config.unitTestFiles], ['unitTest']);
    gulp.watch([config.appFiles, '!' + config.unitTestFiles], ['build', $.browserSync.reload]);
  });
};
