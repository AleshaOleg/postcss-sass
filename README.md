# postcss-sass [![Build Status](https://travis-ci.org/AleshaOleg/postcss-sass.svg?branch=master)](https://travis-ci.org/AleshaOleg/postcss-sass)

[PostCSS](https://github.com/postcss/postcss) parser to convert SASS to PostCSS AST, using [gonzales-pe](https://github.com/tonyganch/gonzales-pe).

## Install
`npm i postcss-sass --save`

## Usage
```
var postcssSass = require("postcss-sass");
// Sass source as argument
postcssSass('div\n  a\n    color: red\n  li\n    color: green');
```
