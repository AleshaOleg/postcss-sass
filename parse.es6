import Input from 'postcss/lib/input';

import Parser from './parser';

export default function sassParse(sass, opts) {
    let input = new Input(sass, opts);

    let parser = new Parser(input);
    parser.parse();

    return parser.root;
}
