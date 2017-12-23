const fs = require('fs');
const gonzales = require('gonzales-pe');

module.exports = function (fileName) {
    const source = fs.readFileSync(
        './__tests__/sass/' + fileName + '.sass',
        'utf-8'
    );

    return gonzales.parse(source, { syntax: 'sass', rule: 'declaration' });
};
