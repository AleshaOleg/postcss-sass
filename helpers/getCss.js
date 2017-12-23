const fs = require('fs');
const postcss = require('postcss');

module.exports = function (fileName) {
    return postcss.parse(fs.readFileSync(
        './__tests__/css/' + fileName + '.css',
        'utf-8'
    ));
};
