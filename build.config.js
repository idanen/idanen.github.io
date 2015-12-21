'use strict';

var outDir = 'build/';

module.exports = {
  host: 'localhost',
  port: 3000,

  // app directories
  appDir: 'app',

  // unit test directories
  unitTestDir: 'app',

  // build test dir
  buildTestDir: outDir + 'test/',

  // build directories
  buildDir: outDir + 'app/',
  buildComponents: outDir + 'app/components/',
  buildCss: outDir + 'app/',
  buildFonts: outDir + 'app/fonts/',
  buildImages: outDir + 'app/img/',
  buildJs: outDir + 'app/js/',
  extDir: outDir + 'app/',
  extCss: outDir + 'app/',
  extFonts: outDir + 'app/fonts/',
  extJs: outDir + 'app/vendor/js/'
};
