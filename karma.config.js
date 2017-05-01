'use strict';
var buildConfig = require('./build.config.js')
  , preprocessors = {}
  , buildTestDir
  , templateDir
  , jsDir;

buildTestDir = buildConfig.buildTestDir;
// add slash if missing to properly strip prefix from directive templates
if (buildTestDir[buildTestDir.length - 1] !== '/') {
  buildTestDir = buildTestDir + '/';
}
templateDir = buildTestDir + 'templates/';

jsDir = buildConfig.buildJs;
// add slash if missing to properly strip prefix from directive templates
if (jsDir[jsDir.length - 1] !== '/') {
  jsDir = jsDir + '/';
}

preprocessors[jsDir + '**/*.js'] = ['coverage'];
// preprocessors[templateDir + '**/*-directive.tpl.html'] = ['ng-html2js'];
preprocessors['**/*.html'] = ['ng-html2js'];

module.exports = {
  browsers: ['Chrome'],
  frameworks: ['jasmine', 'sinon'],
  reporters: ['progress', 'failed', 'coverage'],
  preprocessors: preprocessors,
  autoWatch: true,
  ngHtml2JsPreprocessor: {
    stripPrefix: 'app/',
    moduleName: 'tmpls'
  }/*,
  singleRun: true*/
};
