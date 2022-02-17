# HTML Gulp

## Features

* BEM Structure
* Gulp
* SASS
* HTML or Nunjucks
* JavaScript Concat or JavaScript Webpack
* Images
* SVG Sprite
* Live Server

## Usage

* Install packages: `pnpm i`
* Run for development: `pnpm start`
* Build for development: `pnpm dev`
* Build for production: `pnpm prod`
* Build for development and production in zip archive (look in `build`): `pnpm build`

### Config

* If need nunjucks: in `gulpfile.js` set `config.template = 'njk'`
* If need webpack: in `gulpfile.js` set `config.jsBundler = 'webpack'`
* 🎁 Read `snippet.md`

### SVG Sprite

```
<img width="63" height="63" src="img/sprite.svg#car_engine_24x">
<svg width="63" height="63">
  <use xlink:href="img/sprite.svg#car_engine_24x"></use>
</svg>
```
