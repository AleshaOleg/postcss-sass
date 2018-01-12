const path = require('path');
const fs   = require('fs');

const stringify = require('../stringify');
const parse     = require('../parse');

let tests = fs
    .readdirSync(path.join(__dirname, 'sass'))
    .filter(i => path.extname(i) === '.sass' );

function read(file) {
    return fs.readFileSync(path.join(__dirname, 'sass', file)).toString();
}

function run(sass) {
    let root = parse(sass);
    let output = root.toString(stringify);
    expect(sass.trim()).toEqual(output.trim());
}

for ( let name of tests ) {
    it('stringifies ' + name, () => {
        run(read(name));
    });
}
