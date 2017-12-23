const fs = require('fs');
const sassToPostCss = require('../');

module.exports = function (fileName) {
    const source = fs.readFileSync(
        './__tests__/sass/' + fileName + '.sass',
        'utf-8'
    );
    return sassToPostCss.parse(source);
};
