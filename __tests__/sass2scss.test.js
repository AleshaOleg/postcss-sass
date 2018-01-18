const path = require('path');
const fs = require('fs');
const parse = require('postcss-scss').parse;
const stringify = require('../stringify');

const tests = fs
    .readdirSync(path.join(__dirname, 'cases'))
    .filter(i => path.extname(i) === '.scss' );

function read(file) {
    return fs.readFileSync(path.join(__dirname, 'cases', file)).toString();
}

for ( const name of tests ) {
    it('convert ' + name, () => {
        const sass   = read(name.replace(/\.\w+$/, '.sass'));
        const scss   = read(name);
        expect(parse(scss, { from: name }).toString(stringify).trim()).toEqual(sass.trim());
    });
}
