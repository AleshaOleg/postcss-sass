const fs = require('fs');
const postcss = require('postcss');
const postcssSass = require('../');

module.exports = function (fileName) {
    const source = fs.readFileSync(
        './__tests__/sass/' + fileName + '.sass',
        'utf-8'
    );

    return postcss().process(
        source,
        {
            syntax: postcssSass
        }).then(function (result) {
        return result.content; // Sass with transformations
    });
};
