const sass = require('dart-sass');
const util = require('util');

scss_filename = "./basic.sass";

// Example of using dart-sass
const result = sass.renderSync({file: scss_filename});
console.log((result.buffer).toString());
console.log(sass.render);

module.exports = sass;