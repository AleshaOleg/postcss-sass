const path = require('path');
const fs   = require('fs');

const stringify = require('../stringify');
const parse     = require('../parse');

const tests = fs
    .readdirSync(path.join(__dirname, 'cases'))
    .filter(i => path.extname(i) === '.sass' );

function read(file) {
    return fs.readFileSync(path.join(__dirname, 'cases', file)).toString();
}

function run(sass) {
    const root = parse(sass);
    const output = root.toString(stringify);
    expect(sass.trim()).toEqual(output.trim());
}

for ( const name of tests ) {
    it('stringifies ' + name, () => {
        run(read(name));
    });
}
