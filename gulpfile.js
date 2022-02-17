import gulp from 'gulp'
const { series, parallel, watch, src, dest } = gulp
import browser from 'browser-sync';
const browserSync = browser.create();
import gulpsass from 'gulp-sass';
import gsass from 'sass';
const sass = gulpsass(gsass);
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'gulp-autoprefixer';
import plumber from 'gulp-plumber';
import { onError } from 'gulp-notify';
import fileinclude from 'gulp-file-include';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import webphtml from 'gulp-webp-html-nosvg';
import gcmq from 'gulp-group-css-media-queries';
import cleanCss from 'gulp-clean-css';
import rename from 'gulp-rename';
import concat from 'gulp-concat';
import terser from 'gulp-terser';
import gzip from 'gulp-zip';
import gformatHtml from 'gulp-format-html';
import htmlmin from 'gulp-htmlmin';
import bulkSass from 'gulp-sass-bulk-import';
import svgmin from 'gulp-svgmin';
import sprite from 'gulp-svg-sprite';
import njkRender from 'gulp-nunjucks-render';
import del from 'del';
import webpackStream from 'webpack-stream';
import babel from 'gulp-babel';
import gmode from 'gulp-mode';
const mode = gmode();

const config = {
  // html or njk
  template: 'njk',
  // concat or webpack
  jsBundler: 'concat'
};

export function liveServer() {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    open: false
  });
}

export function copyJS() {
  return src('src/js/**/*.js')
    .pipe(dest('dist/js'));
}

export function copyFont() {
  return src('src/font/**/*')
    .pipe(dest('dist/font'));
}

export function copyImg() {
  return src('src/img/**/*.*')
    .pipe(imagemin())
    .pipe(dest('dist/img'))
    .pipe(webp())
    .pipe(dest('dist/img'));
}

export function svgSprite() {
  return src('src/svg/**/*.svg')
    .pipe(svgmin())
    .pipe(sprite())
    .pipe(dest('dist/img'));
}

export function jsBundle() {
  return src(['src/js/**/*.js', 'src/blocks/**/*.js'])
    .pipe(plumber({
      errorHandler: onError(err => {
        return {
          title: 'JavaScriptBundle',
          sound: false,
          message: err.message
        }
      })
    }))
    .pipe(mode.development(sourcemaps.init()))
    .pipe(concat('bundle.js'))
    .pipe(mode.production(terser()))
    .pipe(mode.development(sourcemaps.write('.')))
    .pipe(dest('dist/js'));
}

export function jsBundleWebpack() {
  return gulp.src('src/js/index.js')
    .pipe(plumber({
      errorHandler: onError(err => {
        return {
          title: 'JavaScriptBundleWebpack',
          sound: false,
          message: err.message
        }
      })
    }))
    .pipe(webpackStream({
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
              chunks: 'all'
            }
          }
        }
      }
    }))
    .pipe(babel({ presets: ['@babel/preset-env'] }))
    .pipe(mode.development(sourcemaps.init()))
    .pipe(mode.production(terser()))
    .pipe(mode.development(sourcemaps.write('.')))
    .pipe(gulp.dest('dist/js'));
}

export function html() {
  return src('src/*.html')
    .pipe(plumber({
      errorHandler: onError(err => {
        return {
          title: 'HTML',
          sound: false,
          message: err.message
        }
      })
    }))
    .pipe(fileinclude({
      // prefix: '@@',
      prefix: '{',
      suffix: '}',
      basepath: '@file'
    }))
    .pipe(webphtml())
    .pipe(gformatHtml({
      indent_size: 2,
      extra_liners: [],
      preserve_newlines: false,
      end_with_newline: true
    }))
    .pipe(mode.production(htmlmin({ collapseWhitespace: true })))
    .pipe(dest('dist'));
}

export function scss() {
  return src('src/scss/index.scss')
    .pipe(plumber({
      errorHandler: onError(function (err) {
        return {
          title: 'SCSS',
          sound: false,
          message: err.message
        }
      })
    }))
    .pipe(mode.development(sourcemaps.init()))
    .pipe(bulkSass())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer({
      cascade: false
    }))
    .pipe(gcmq())
    .pipe(mode.development(sourcemaps.write()))
    .pipe(rename({ basename: 'bundle' }))
    .pipe(mode.production(cleanCss()))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream());
}

export function njk() {
  return src('src/*.njk')
    .pipe(plumber({
      errorHandler: onError(err => {
        return {
          title: 'Nunjucks',
          sound: false,
          message: err.message
        }
      })
    }))
    .pipe(njkRender({ path: ['src'] }))
    .pipe(webphtml())
    .pipe(gformatHtml({
      indent_size: 2,
      extra_liners: [],
      preserve_newlines: false,
      end_with_newline: true
    }))
    .pipe(mode.production(htmlmin({ collapseWhitespace: true })))
    .pipe(dest('dist'));
}

export function clean() {
  return del(['dist']);
}

export function zip() {
  return gulp.src('dist/**/*')
    .pipe(mode.development(gzip('build.zip')))
    .pipe(mode.production(gzip('build.min.zip')))
    .pipe(gulp.dest('build'));
}

function templateChoice() {
  if (config.template === 'html') {
    return html();
  } else if (config.template === 'njk') {
    return njk();
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
    watch(['src/js/**/*.js', 'src/blocks/**/*.js'], parallel(jsBundle));
  } else if (config.jsBundler === 'webpack') {
    watch(['src/js/**/*.js', 'src/blocks/**/*.js'], parallel(jsBundleWebpack));
  }
  watch('src/font/**/*', parallel(copyFont));
  watch('src/img/**/*.*', parallel(copyImg));
  watch('src/svg/**/*.svg', parallel(svgSprite));
  if (config.template === 'html') {
    watch(['src/html/**/*.html', 'src/blocks/**/*.html', 'src/*.html'], parallel(html));
  } else if (config.template === 'njk') {
    watch(['src/njk/**/*.njk', 'src/blocks/**/*.njk', 'src/*.njk'], parallel(njk));
  }
  watch(['src/scss/**/*.scss', 'src/blocks/**/*.scss'], parallel(scss));
  watch(['dist/*.html', 'dist/css/**/*.css', 'dist/js/**/*.js', 'dist/img/**/*']).on('change', browserSync.reload);
}

export const build = series(
  parallel(clean),
  parallel(scss, copyFont, copyImg, svgSprite),
  parallel(templateChoice),
  // parallel(njk),
  // parallel(html),
  parallel(jsBundlerChoice),
  // parallel(jsBundle),
  // parallel(jsBundleWebpack),
  parallel(zip)
);

export default series(
  parallel(clean),
  parallel(scss, copyFont, copyImg, svgSprite),
  parallel(templateChoice),
  // parallel(njk),
  // parallel(html),
  parallel(jsBundlerChoice),
  // parallel(jsBundle),
  // parallel(jsBundleWebpack),
  parallel(liveServer, watching)
);
