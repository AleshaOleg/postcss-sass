const jsonify = require('postcss-parser-tests').jsonify;
const path = require('path');
const fs = require('fs');
const parse = require('../parse');

const tests = fs
    .readdirSync(path.join(__dirname, 'cases'))
    .filter(i => path.extname(i) === '.sass' );

function read(file) {
    return fs.readFileSync(path.join(__dirname, 'cases', file)).toString();
}

for (const name of tests) {
    it('parses ' + name, () => {
        const sass   = read(name);
        const root   = parse(sass, { from: name });
        expect(jsonify(root)).toMatchSnapshot();
    });
}
