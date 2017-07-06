var fs = require('fs');
var postcss = require('postcss');
var postcssSass = require('../');
var stringify = require('../stringify');

module.exports = function (fileName) {
    var source = fs.readFileSync(
        './__tests__/sass/' + fileName + '.sass',
        'utf-8'
    );

    return postcss().process(
        source,
        {
            parser: postcssSass,
            stringifier: stringify
        }).then(function (result) {
        return result.content; // Sass with transformations
    });
};

