var sass = require('dart-sass');

scss_filename = "basic.sass"

sass.render({data: 'body{background:blue; a{color:black;}}', function(err, result) {
  console.log(result);
  console.log(err);
});