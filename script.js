var sass = require('dart-sass');

scss_filename = "basic.sass"

sass.render({file: scss_filename}, function(err, result) {
  console.log(result);
  console.log(err);
});