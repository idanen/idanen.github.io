'use strict';

var _ = require('lodash')
  , buildConfig = require('./build.config')
  , config = {}
  , gulp = require('gulp')
  , gulpFiles = require('require-dir')('./gulp')
  , path = require('path')
  , $, key;

$ = require('gulp-load-plugins')({
  pattern: [
  'browser-sync',
  'del',
  'gulp-*',
  'karma',
  'main-bower-files',
  'multi-glob',
  'plato',
  'run-sequence',
  'streamqueue',
  'uglify-save-license',
  'wiredep',
  'yargs'
  ]
});

_.merge(config, buildConfig);

config.appComponents = path.join(config.appDir, 'components/**/*');
config.appStyleComponents = path.join(config.appDir, 'styles/components/**/*');
config.appFiles = path.join(config.appDir, '**/*');
config.appFontFiles = path.join(config.appDir, 'styles/fonts/**/*');
config.appImageFiles = path.join(config.appDir, 'img/**/*');
config.appMarkupFiles = path.join(config.appDir, '**/*.html');
config.appScriptFiles = path.join(config.appDir, '**/*.js');
config.appDataFiles = path.join(config.appDir, '**/*.json');
config.appStyleFiles = path.join(config.appDir, '**/*.scss');

config.buildDirectiveTemplateFiles = path.join(config.buildDir, '**/*directive.tpl.html');
config.buildJsFiles = path.join(config.buildJs, '**/*.js');

config.buildTestDirectiveTemplateFiles = path.join(config.buildTestDir, '**/*directive.tpl.html');
config.buildE2eTestsDir = path.join(config.buildTestDir, 'e2e');
config.buildE2eTests = path.join(config.buildE2eTestsDir, '**/*.test.js');
config.buildTestDirectiveTemplatesDir = path.join(config.buildTestDir, 'templates');
config.buildUnitTestsDir = path.join(config.buildTestDir, config.unitTestDir);
config.buildUnitTestFiles = path.join(config.buildUnitTestsDir, '**/*.test.js');

config.e2eFiles = path.join('e2e', '**/*.js');
config.unitTestFiles = path.join(config.unitTestDir, '**/*.test.js');

config.firebaseConfigFile = path.join(config.appDir, 'scripts/angularfire/firebase-config.src.js');
config.firebaseConfigBuiltFile = path.join(config.appDir, 'scripts/angularfire/firebase-config.js');

for (key in gulpFiles) {
  gulpFiles[key](gulp, $, config);
}

gulp.task('dev', ['build'], function () {
  gulp.start('browserSync');
  gulp.start('watch');
});

gulp.task('default', ['dev']);

gulp.task('runProd', ['build'], function () {
  gulp.start('browserSync');
});
