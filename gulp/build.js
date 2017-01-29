'use strict';

var _ = require('underscore.string')
  , fs = require('fs')
  , path = require('path')
  , swPrecache = require('sw-precache')
  , bowerDir = JSON.parse(fs.readFileSync('.bowerrc')).directory + path.sep;

module.exports = function (gulp, $, config) {
  var isProd = $.yargs.argv.stage === 'prod';

  // delete build directory
  gulp.task('clean', function () {
    return $.del(config.buildDir);
  });

  // compile markup files and copy into build directory
  gulp.task('markup', ['clean'], function () {
    return gulp.src([
      config.appMarkupFiles,
      config.appDataFiles,
      '!' + config.appComponents
    ])
      .pipe(gulp.dest(config.buildDir));
  });

  // compile styles and copy into build directory
  gulp.task('styles', ['clean'], function () {
    return gulp.src([
      config.appStyleFiles,
      '!' + config.appComponents,
      '!' + config.appStyleComponents
    ])
      .pipe($.plumber({errorHandler: function (err) {
        $.notify.onError({
          title: 'Error linting at ' + err.plugin,
          subtitle: ' ', //overrides defaults
          message: err.message.replace(/\u001b\[.*?m/g, ''),
          sound: ' ' //overrides defaults
        })(err);

        this.emit('end');
      }}))
      .pipe($.sass())
      .pipe($.autoprefixer())
      //.pipe($.if(isProd, $.cssRebaseUrls()))
      .pipe($.if(isProd, $.modifyCssUrls({
        modify: function (url) {
          // determine if url is using http, https, or data protocol
          // cssRebaseUrls rebases these URLs, too, so we need to fix that
          var beginUrl = url.indexOf('http:');
          if (beginUrl < 0) {
            beginUrl = url.indexOf('https:');
          }
          if (beginUrl < 0) {
            beginUrl = url.indexOf('data:');
          }

          if (beginUrl > -1) {
            return url.substring(beginUrl, url.length);
          }

          // prepend all other urls
          //return '../' + url;
          return url;
        }
      })))
      .pipe($.if(isProd, $.concat('app.css')))
      .pipe($.if(isProd, $.cssmin()))
      .pipe($.if(isProd, $.rev()))
      .pipe(gulp.dest(config.buildCss));
  });

  // compile scripts and copy into build directory
  gulp.task('scripts', ['clean', 'analyze', 'markup'], function () {
    var htmlFilter = $.filter('**/*.html', {restore: true})
      , jsFilter = $.filter('**/*.js', {restore: true});

    return gulp.src([
      config.appScriptFiles,
      config.buildDir + '**/*.html',
      '!' + config.appComponents,
      '!**/*.test.*',
      '!**/index.html',
      '!**/runtime-caching.js',
      '!**/notifications-sw.js',
      '!**/sw-toolbox.js',
      '!**/service-worker.js'
    ])
      .pipe($.sourcemaps.init())
      .pipe($.if(isProd, htmlFilter))
      .pipe($.if(isProd, $.ngHtml2js({
        // lower camel case all app names
        moduleName: _.camelize(_.slugify(_.humanize(require('../package.json').name))),
        declareModule: false,
        prefix: ''
      })))
      .pipe($.if(isProd, htmlFilter.restore))
      .pipe(jsFilter)
      .pipe($.babel({
        presets: ['es2015']
      }))
      .pipe($.if(isProd, $.angularFilesort()))
      .pipe($.if(isProd, $.concat('app.js')))
      .pipe($.if(isProd, $.ngAnnotate()))
      .pipe($.if(isProd, $.uglify().on('error', function(e) { console.log('\x07',e.message); return this.end(); })))
      .pipe($.if(isProd, $.rev()))
      .pipe($.addSrc(`${bowerDir}/webcomponentsjs/webcomponents*.js`))
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(config.buildJs))
      .pipe(jsFilter.restore);
  });

  // inject custom CSS and JavaScript into index.html
  gulp.task('inject', ['markup', 'styles', 'scripts'], function () {
    var jsFilter = $.filter('**/*.js', {restore: true});

    return gulp.src(config.buildDir + 'index.html')
      .pipe($.inject(gulp.src([
          config.buildCss + '**/*',
          config.buildJs + '**/*',
          '!' + config.buildJs + 'scripts/sw/*.js',
          '!**/webcomponents*.js'
        ])
        .pipe(jsFilter)
        .pipe($.angularFilesort())
        .pipe(jsFilter.restore), {
          addRootSlash: false,
          ignorePath: config.buildDir
        })
      )
      .pipe($.inject(gulp.src([
          config.buildJs + 'webcomponents-lite.min.js'
        ]), {
          starttag: '<!-- inject:head:{{ext}} -->',
          endtag: '<!-- endinject -->',
          addRootSlash: false,
          transform: transformScriptTagWithAsync,
          ignorePath: config.buildDir
        })
      )
      .pipe(gulp.dest(config.buildDir));
  });

  // copy bower components into build directory
  gulp.task('bowerCopy', ['inject'], function () {
    var cssFilter = $.filter('**/*.css', {restore: true})
      , jsFilter = $.filter([
        '**/*.js',
        '!**/webcomponents*.js',
        '!**/sw-toolbox.js'
      ], {restore: true})
      , ngStrapPath = 'bower_components/angular-strap/';

    // Fix ui-bootstrap and angular-strap colliding
    gulp.src(ngStrapPath + '**/*.js')
      .pipe($.ngAnnotate({add: true, remove: true, rename: [{from: '$tooltip', to: '$asTooltip'}]}))
      .pipe(gulp.dest(ngStrapPath));

    return gulp.src($.mainBowerFiles(), {base: bowerDir})
      .pipe(cssFilter)
      .pipe($.if(isProd, $.modifyCssUrls({
        modify: function (url, filePath) {
          if (url.indexOf('http') !== 0 && url.indexOf('data:') !== 0) {
            filePath = path.dirname(filePath) + path.sep;
            filePath = filePath.substring(filePath.indexOf(bowerDir) + bowerDir.length,
              filePath.length);
          }
          url = path.normalize(filePath + url);
          url = url.replace(/[/\\]/g, '/');
          return url;
        }
      })))
      .pipe($.if(isProd, $.concat('vendor.css')))
      .pipe($.if(isProd, $.cssmin()))
      .pipe($.if(isProd, $.rev()))
      .pipe(gulp.dest(config.extDir))
      .pipe(cssFilter.restore)
      .pipe(jsFilter)
      .pipe($.if(isProd, $.concat('vendor.js')))
      .pipe($.if(isProd, $.uglify({
        preserveComments: $.uglifySaveLicense
      })))
      .pipe($.if(isProd, $.rev()))
      .pipe(gulp.dest(config.extDir))
      .pipe(jsFilter.restore);
  });

  // inject bower components into index.html
  gulp.task('bowerInject', ['bowerCopy'], function () {
    if (isProd) {
      return gulp.src(config.buildDir + 'index.html')
        .pipe($.inject(gulp.src([
          config.extDir + 'vendor*.css',
          config.extDir + 'vendor*.js'
        ], {
          read: false
        }), {
          starttag: '<!-- bower:{{ext}} -->',
          endtag: '<!-- endbower -->',
          addRootSlash: false,
          ignorePath: config.buildDir
        }))
        .pipe($.htmlmin({
          collapseWhitespace: true,
          removeComments: true
        }))
        .pipe(gulp.dest(config.buildDir));
    } else {
      return gulp.src(config.buildDir + 'index.html')
        .pipe($.wiredep.stream({
          exclude: [/webcomponents/, /sw-toolbox/],
          ignorePath: '../../' + bowerDir.replace(/\\/g, '/'),
          fileTypes: {
            html: {
              replace: {
                css: function (filePath) {
                  return '<link rel="stylesheet" href="' + config.extDir.replace(config.buildDir, '') +
                    filePath + '">';
                },
                js: function (filePath) {
                  return '<script src="' + config.extDir.replace(config.buildDir, '') +
                    filePath + '"></script>';
                }
              }
            }
          }
        }))
        .pipe(gulp.dest(config.buildDir));
    }
  });

  // compile components and copy into build directory
  gulp.task('components', ['bowerInject'], function () {
    var polymerBowerAssetsToCopy
      , styleFilter = $.filter('**/*.scss', {restore: true});

    // List all Bower component assets that should be copied to the build
    // directory. The Bower directory is automatically prepended via the
    // map function.
    polymerBowerAssetsToCopy = [
      'polymer/polymer*.html',
      'iron-a11y-announcer/iron-a11y-announcer.html',
      'iron-overlay-behavior/iron-overlay-behavior.html',
      'iron-flex-layout/iron-flex-layout.html',
      'iron-flex-layout/classes/*.html',
      'iron-resizable-behavior/iron-resizable-behavior.html',
      'iron-overlay-behavior/iron-overlay-backdrop.html',
      'iron-fit-behavior/iron-fit-behavior.html',
      'iron-overlay-behavior/iron-overlay-manager.html',
      'font-roboto/roboto.html ',
      'paper-styles/{color,default-theme,paper-styles,shadow.html,typography.html}',
      'paper-toast/paper-toast.html'
    ].map(function (file) {
      return bowerDir + file;
    });

    return gulp.src(config.appComponents)
      .pipe($.addSrc(polymerBowerAssetsToCopy, {base: bowerDir}))
      .pipe($.sourcemaps.init())
      .pipe(styleFilter)
      .pipe($.sass())
      .pipe(styleFilter.restore)
      .pipe($.sourcemaps.write('.'))
      .pipe(gulp.dest(config.buildComponents));
  });

  // inject components
  gulp.task('componentsInject', ['components'], function () {
    // List all Polymer and custom copmonents that should be injected
    // into index.html. The are injected in the order listed and the
    // components directory is automatically prepended via the
    // map function.
    var polymerAssetsToInject = [
      'polymer/polymer.html',
      'paper-toast/paper-toast.html'
    ].map(function (file) {
      return config.buildComponents + file;
    });

    return gulp.src(config.buildDir + 'index.html')
      .pipe($.inject(gulp.src(polymerAssetsToInject), {
          starttag: '<!-- inject:html -->',
          endtag: '<!-- endinject -->',
          addRootSlash: false,
          ignorePath: config.buildDir
        })
      )
      .pipe(gulp.dest(config.buildDir));
  });

  // vulcanize web components
  gulp.task('vulcanize', ['bowerInject'], function () {
    return gulp.src(config.appComponents)
      .pipe($.vulcanize())
      .pipe($.if(isProd, $.htmlmin({
        collapseWhitespace: true,
        removeComments: true
      })))
      .pipe(gulp.dest('build/app/components/'));
  });

  // copy Bower fonts and images into build directory
  gulp.task('bowerAssets', ['clean'], function () {
    var assetFilter = $.filter('**/*.{eot,otf,svg,ttf,woff,woff2,gif,jpg,jpeg,png}', {restore: true});
    return gulp.src($.mainBowerFiles(), {base: bowerDir})
      .pipe(assetFilter)
      .pipe(gulp.dest(config.extDir))
      .pipe(assetFilter.restore);
  });

  // copy custom fonts into build directory
  gulp.task('fonts', ['clean'], function () {
    var fontFilter = $.filter(['**/*.{eot,otf,svg,ttf,woff,woff2}', '!**/*{fontawesome,glyphicons,FontAwesome}*'], {restore: true}),
        fontsDest = isProd ? config.buildFontsProd : config.buildFonts;
    return gulp.src([config.appFontFiles])
      .pipe(fontFilter)
      .pipe(gulp.dest(fontsDest))
      .pipe(fontFilter.restore);
  });

  // copy and optimize images into build directory
  gulp.task('images', ['clean'], function () {
    return gulp.src(config.appImageFiles)
      .pipe($.if(isProd, $.imagemin()))
      .pipe(gulp.dest(config.buildImages));
  });

  gulp.task('copyTemplates', ['vulcanize'], function () {
    // always copy templates to testBuild directory
    var stream = $.streamqueue({objectMode: true});

    stream.queue(gulp.src([config.buildDirectiveTemplateFiles]));

    return stream.done()
      .pipe(gulp.dest(config.buildTestDirectiveTemplatesDir));
  });

  gulp.task('deleteTemplates', ['copyTemplates'], function (cb) {
    // only delete templates in production
    // the templates are injected into the app during prod build
    if (!isProd) {
      return cb();
    }

    gulp.src([config.buildDir + '**/*.html'])
      .pipe(gulp.dest('tmp/' + config.buildDir))
      .on('end', function () {
        $.del([
          config.buildDir + '*',
          '!' + config.buildComponents,
          '!' + config.buildCss,
          '!' + config.buildFonts,
          '!' + config.buildFontsProd,
          '!' + config.buildImages,
          '!' + config.buildJs,
          '!' + config.extDir,
          '!' + config.buildDir + 'partials/**/*.html',
          '!' + config.buildDir + 'service-worker.js',
          '!' + config.buildDir + 'manifest.json',
          '!' + config.buildDir + 'index.html'
        ], {mark: true})
          .then(function () {
            cb();
          });
      });
  });

  // Copy over the scripts that are used in importScripts as part of the generate-service-worker task.
  gulp.task('copy-sw-scripts', ['clean'], function () {
    return gulp.src([
      'node_modules/sw-toolbox/sw-toolbox.js',
      'bower_components/firebase/firebase.js',
      'app/scripts/sw/runtime-caching.js',
      'app/scripts/sw/notifications-sw.js'])
      .pipe(gulp.dest('build/app/js/scripts/sw'));
  });

  // See http://www.html5rocks.com/en/tutorials/service-worker/introduction/ for
  // an in-depth explanation of what service workers are and why you should care.
  // Generate a service worker file that will provide offline functionality for
  // local resources. This should only be done for the 'dist' directory, to allow
  // live reload to work as expected when serving from the 'app' directory.
  gulp.task('generate-service-worker', ['copy-sw-scripts'], function () {
    var rootDir = 'build/app';
    var filepath = path.join(rootDir, 'service-worker.js');

    return swPrecache.write(filepath, {
      // Used to avoid cache conflicts when serving on localhost.
      cacheId: require('../package.json').name || 'web-starter-kit',
      // sw-toolbox.js needs to be listed first. It sets up methods used in runtime-caching.js.
      importScripts: [
        '/js/scripts/sw/sw-toolbox.js',
        '/js/scripts/sw/runtime-caching.js',
        '/js/scripts/sw/firebase.js',
        '/js/scripts/sw/notifications-sw.js'
      ],
      staticFileGlobs: [
        // Add/remove glob patterns to match your directory setup.
        rootDir + '/img/**/*',
        rootDir + '/js/**/*.js',
        rootDir + '/scripts/**/*.js',
        rootDir + '/vendor/**/*.js',
        rootDir + '/styles/**/*.css',
        rootDir + '/vendor/**/*.css',
        rootDir + '/vendor/fonts/**/*.{otf,eot,svg,ttf,woff,woff2}',
        rootDir + '/fonts/**/*.{otf,eot,svg,ttf,woff,woff2}',
        rootDir + '/scripts/**/*.html',
        rootDir + '/partials/**/*.{html,json}',
        rootDir + '/*.{html,json}'
      ],
      // Translates a static file path to the relative URL that it's served from.
      stripPrefix: path.join(rootDir, path.sep)
    });
  });

  gulp.task('build', ['deleteTemplates', 'bowerAssets', 'images', 'fonts', 'generate-service-worker']);

  function transformScriptTagWithAsync(filepath) {
    return '<script async src="' + filepath + '"></script>';
  }
};
