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
import htmlmin from 'gulp-htmlmin';
import bulkSass from 'gulp-sass-bulk-import';
import svgmin from 'gulp-svgmin';
import sprite from 'gulp-svg-sprite';
import beautify from 'gulp-beautify';
import njkRender from 'gulp-nunjucks-render';
import del from 'del';
import webpackStream from 'webpack-stream';
import babel from 'gulp-babel';
import gmode from 'gulp-mode';
const mode = gmode();

const config = {
  env: process.env.NODE_ENV,
  pages: 'src/html/*.html',
  srcHtml: ['src/html/include/*.html', 'src/html/*.html'],
  distHtml: 'dist/*.html',
  srcJS: 'src/js/**/*.js',
  distJS: 'dist/js',
  srcImg: 'src/img/**/*.*',
  distImg: 'dist/img',
  srcScss: 'src/scss/**/*.scss',
  distCss: 'dist/css/**/*.css',
  srcSvg: 'src/svg/**/*.svg',
  distSvg: 'dist/img',
  srcNjk: 'src/njk/**/*',
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
  return src(config.srcJS)
    .pipe(dest('dist/js'));
}

export function copyImg() {
  return src(config.srcImg)
    .pipe(imagemin())
    .pipe(dest(config.distImg))
    .pipe(webp())
    .pipe(dest(config.distImg));
}

export function svgSprite() {
  return src(config.srcSvg)
    .pipe(svgmin())
    .pipe(sprite())
    .pipe(dest(config.distSvg));
}

export function jsBundle() {
  return src(config.srcJS)
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
    .pipe(dest(config.distJS));
}

export function jsBundleWebpack() {
  return gulp.src('./src/js/index.js')
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
        filename: 'bundle.js'
      }
    }))
    .pipe(babel({ presets: ['@babel/env'] }))
    .pipe(mode.development(sourcemaps.init()))
    .pipe(mode.production(terser()))
    .pipe(mode.development(sourcemaps.write('.')))
    .pipe(gulp.dest(config.distJS));
}

export function html() {
  return src(config.pages)
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
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(webphtml())
    .pipe(beautify.html({ indent_size: 2, extra_liners: [], preserve_newlines: false }))
    .pipe(dest('dist'));
}

export function scss() {
  return src(config.srcScss)
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
  return src('src/njk/*.+(html|njk)')
    .pipe(plumber({
      errorHandler: onError(err => {
        return {
          title: 'Nunjucks',
          sound: false,
          message: err.message
        }
      })
    }))
    .pipe(njkRender({ path: ['src/njk'] }))
    .pipe(webphtml())
    .pipe(beautify.html({ indent_size: 2, extra_liners: [], preserve_newlines: false }))
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

export function watching() {
  watch(config.srcJS, parallel(jsBundle));
  // watch(config.srcJS, parallel(jsBundleWebpack));
  watch(config.srcImg, parallel(copyImg));
  watch(config.srcSvg, parallel(svgSprite));
  watch(config.srcNjk, parallel(njk));
  // watch(config.srcHtml, parallel(html));
  watch(config.srcScss, parallel(scss));
  watch([config.distHtml, config.distCss, 'dist/js/**/*.js', 'dist/img/**/*']).on('change', browserSync.reload);
}

gulp.task('build', series(
  parallel(clean),
  parallel(scss, njk, copyImg, svgSprite),
  parallel(jsBundle),
  // parallel(jsBundleWebpack),
  parallel(zip)
));

export default series(
  parallel(clean),
  parallel(scss, njk, copyImg, svgSprite),
  parallel(jsBundle),
  // parallel(jsBundleWebpack),
  parallel(liveServer, watching)
);
