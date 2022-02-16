# HTML Gulp

## Features

* Gulp
* SASS
* Nunjucks
* Webpack (optional)
* SVG Sprite
* Live Server

## Usage

* Install packages: `pnpm i`
* Run for development: `pnpm start`
* Build for development: `pnpm dev`
* Build for production: `pnpm prod`
* Build for development and production in zip archive (look in `build`): `pnpm build`

### SVG Sprite

`<img width="63" height="63" src="img/sprite.svg#car_engine_24x">`
or
`<svg width="63" height="63">
  <use xlink:href="img/sprite.svg#car_engine_24x"></use>
</svg>`
