# HTML Gulp

## Features

* BEM Structure
* Gulp
* SASS
* HTML or Nunjucks or Pug
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
* 🎁 Read [snippet.md](snippet.md)

### Config gulpfile.js

``` bash
# If need include html
config.template = 'html'

# If need include nunjucks
config.template = 'njk'

# If need include pug
config.template = 'pug'

# If need concat
config.jsBundler = 'concat'

# If need webpack
config.jsBundler = 'webpack'
```

### SVG Sprite

```
<img width="63" height="63" src="img/sprite.svg#car_engine_24x">
<svg width="63" height="63">
  <use xlink:href="img/sprite.svg#car_engine_24x"></use>
</svg>
```
