import browser from 'browser-sync';
import del from 'del';
import gulp from 'gulp';
import autoprefixer from 'gulp-autoprefixer';
import babel from 'gulp-babel';
import cleanCss from 'gulp-clean-css';
import concat from 'gulp-concat';
import fileInclude from 'gulp-file-include';
import gFormatHtml from 'gulp-format-html';
import gCmq from 'gulp-group-css-media-queries';
import htmlmin from 'gulp-htmlmin';
import imagemin from 'gulp-imagemin';
import gMode from 'gulp-mode';
import { onError } from 'gulp-notify';
import njkRender from 'gulp-nunjucks-render';
import plumber from 'gulp-plumber';
import pugRender from 'gulp-pug';
import rename from 'gulp-rename';
import gulpSass from 'gulp-sass';
import bulkSass from 'gulp-sass-bulk-import';
import sourcemaps from 'gulp-sourcemaps';
import sprite from 'gulp-svg-sprite';
import svgmin from 'gulp-svgmin';
import terser from 'gulp-terser';
import webp from 'gulp-webp';
import webpHtml from 'gulp-webp-html-nosvg';
import gzip from 'gulp-zip';
import gSass from 'sass';
import webpackStream from 'webpack-stream';

const { series, parallel, watch, src, dest } = gulp;
const browserSync = browser.create();
const sass = gulpSass(gSass);
const mode = gMode();

const config = {
  // html or njk or pug
  template: 'pug',
  // concat or webpack
  jsBundler: 'concat',
};

const srcBem = (path) => {
  return 'src/blocks' + path;
};

const dist = (path = '') => {
  return 'dist' + path;
};

export function liveServer() {
  browserSync.init({
    server: {
      baseDir: dist(),
    },
    open: false,
  });
}

export function copyJS() {
  return src('src/js/**/*.js').pipe(dest(dist('/js')));
}

export function copyFont() {
  return src('src/fonts/**/*').pipe(dest(dist('/fonts')));
}

export function copyImg() {
  return src('src/img/**/*.*')
    .pipe(imagemin())
    .pipe(dest(dist('/img')))
    .pipe(webp())
    .pipe(dest(dist('/img')));
}

export function svgSprite() {
  return src('src/svg/**/*.svg')
    .pipe(svgmin())
    .pipe(sprite())
    .pipe(dest(dist('/img')));
}

export function jsBundle() {
  return src(['src/js/**/*.js', srcBem('/**/*.js')])
    .pipe(
      plumber({
        errorHandler: onError((err) => {
          return {
            title: 'JavaScriptBundle',
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(mode.development(sourcemaps.init()))
    .pipe(concat('bundle.js'))
    .pipe(mode.production(terser()))
    .pipe(mode.development(sourcemaps.write('.')))
    .pipe(dest(dist('/js')));
}

export function jsBundleWebpack() {
  return src('src/js/index.js')
    .pipe(
      plumber({
        errorHandler: onError((err) => {
          return {
            title: 'JavaScriptBundleWebpack',
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(
      webpackStream({
        mode: mode.development() ? 'development' : 'production',
        output: {
          // filename: 'bundle.js',
          // filename: '[name].js',
          filename: (pathData) => {
            if (pathData.chunk.name === 'main') {
              return 'bundle.js';
            } else {
              return 'vendor.js';
            }
          },
          // chunkFilename: 'vendor.js',
        },
        optimization: {
          splitChunks: {
            chunks: 'all',
            cacheGroups: {
              vendor: {
                test: /node_modules/,
                name: 'vendor',
                chunks: 'all',
              },
            },
          },
        },
      })
    )
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(mode.development(sourcemaps.init()))
    .pipe(mode.production(terser()))
    .pipe(mode.development(sourcemaps.write('.')))
    .pipe(dest(dist('/js')));
}

export function html() {
  return src('src/*.html')
    .pipe(
      plumber({
        errorHandler: onError((err) => {
          return {
            title: 'HTML',
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(
      fileInclude({
        // prefix: '@@',
        prefix: '{',
        suffix: '}',
        basepath: '@file',
      })
    )
    .pipe(webpHtml())
    .pipe(
      gFormatHtml({
        indent_size: 2,
        extra_liners: [],
        preserve_newlines: false,
        end_with_newline: true,
      })
    )
    .pipe(mode.production(htmlmin({ collapseWhitespace: true })))
    .pipe(dest(dist()));
}

export function njk() {
  return src('src/*.njk')
    .pipe(
      plumber({
        errorHandler: onError((err) => {
          return {
            title: 'Nunjucks',
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(njkRender({ path: ['src'] }))
    .pipe(webpHtml())
    .pipe(
      gFormatHtml({
        indent_size: 2,
        extra_liners: [],
        preserve_newlines: false,
        end_with_newline: true,
      })
    )
    .pipe(mode.production(htmlmin({ collapseWhitespace: true })))
    .pipe(dest(dist()));
}

export function pug() {
  return src('src/*.pug')
    .pipe(
      plumber({
        errorHandler: onError((err) => {
          return {
            title: 'Pug',
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(pugRender())
    .pipe(webpHtml())
    .pipe(
      gFormatHtml({
        indent_size: 2,
        extra_liners: [],
        preserve_newlines: false,
        end_with_newline: true,
      })
    )
    .pipe(mode.production(htmlmin({ collapseWhitespace: true })))
    .pipe(dest(dist()));
}

export function scss() {
  return src('src/scss/index.scss')
    .pipe(
      plumber({
        errorHandler: onError(function (err) {
          return {
            title: 'SCSS',
            sound: false,
            message: err.message,
          };
        }),
      })
    )
    .pipe(mode.development(sourcemaps.init()))
    .pipe(bulkSass())
    .pipe(sass().on('error', sass.logError))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(gCmq())
    .pipe(mode.development(sourcemaps.write()))
    .pipe(rename({ basename: 'bundle' }))
    .pipe(mode.production(cleanCss()))
    .pipe(dest(dist('/css')))
    .pipe(browserSync.stream());
}

export function clean() {
  return del([dist()]);
}

export function zip() {
  return src(dist('/**/*'))
    .pipe(mode.development(gzip('build.zip')))
    .pipe(mode.production(gzip('build.min.zip')))
    .pipe(dest('build'));
}

function templateChoice() {
  if (config.template === 'html') {
    return html();
  } else if (config.template === 'njk') {
    return njk();
  } else if (config.template === 'pug') {
    return pug();
  }
}

function jsBundlerChoice() {
  if (config.jsBundler === 'concat') {
    return jsBundle();
  } else if (config.jsBundler === 'webpack') {
    return jsBundleWebpack();
  }
}

export function watching() {
  if (config.jsBundler === 'concat') {
    watch(['src/js/**/*.js', srcBem('/**/*.js')], parallel(jsBundle));
  } else if (config.jsBundler === 'webpack') {
    watch(['src/js/**/*.js', srcBem('/**/*.js')], parallel(jsBundleWebpack));
  }
  watch('src/font/**/*', parallel(copyFont));
  watch('src/img/**/*.*', parallel(copyImg));
  watch('src/svg/**/*.svg', parallel(svgSprite));
  if (config.template === 'html') {
    watch(
      ['src/html/**/*.html', srcBem('/**/*.html'), 'src/*.html'],
      parallel(html)
    );
  } else if (config.template === 'njk') {
    watch(
      ['src/njk/**/*.njk', srcBem('/**/*.njk'), 'src/*.njk'],
      parallel(njk)
    );
  } else if (config.template === 'pug') {
    watch(
      ['src/pug/**/*.pug', srcBem('/**/*.pug'), 'src/*.pug'],
      parallel(pug)
    );
  }
  watch(['src/scss/**/*.scss', srcBem('/**/*.scss')], parallel(scss));
  watch([
    dist('/*.html'),
    dist('/css/**/*.css'),
    dist('/js/**/*.js'),
    dist('/img/**/*'),
  ]).on('change', browserSync.reload);
}

export const build = series(
  parallel(clean),
  parallel(scss, copyFont, copyImg, svgSprite),
  parallel(templateChoice),
  parallel(jsBundlerChoice),
  parallel(zip)
);

export default series(
  parallel(clean),
  parallel(scss, copyFont, copyImg, svgSprite),
  parallel(templateChoice),
  parallel(jsBundlerChoice),
  parallel(liveServer, watching)
);
