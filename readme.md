# HTML Gulp

## Features

* Gulp
* SASS
* Nunjucks
* Webpack (optional)
* SVG Sprite
* Live Server

## Usage

* Install packages: `npm i`
* Run for development: `npm start`
* Build for development: `npm run dev`
* Build for production: `npm run prod`
* Build for development and production in zip archive (look in `build`): `npm run build`

### SVG Sprite

`<img width="63" height="63" src="img/sprite.svg#car_engine_24x">`
or
`<svg width="63" height="63">
  <use xlink:href="img/sprite.svg#car_engine_24x"></use>
</svg>`
