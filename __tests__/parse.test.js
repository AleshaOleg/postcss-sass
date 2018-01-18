const jsonify = require('postcss-parser-tests').jsonify;
const path = require('path');
const fs = require('fs');
const parse = require('../parse');

let tests = fs
    .readdirSync(path.join(__dirname, 'cases'))
    .filter(i => path.extname(i) === '.sass' );

function read(file) {
    return fs.readFileSync(path.join(__dirname, 'cases', file)).toString();
}

for ( let name of tests ) {
    it('parses ' + name, () => {
        let sass   = read(name);
        let root   = parse(sass, { from: name });
        expect(jsonify(root)).toMatchSnapshot();
    });
}
