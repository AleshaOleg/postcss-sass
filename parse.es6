import Input from 'postcss/lib/input';

import Parser from './parser';

export default function sassParse(sass, opts) {
    const input = new Input(sass, opts);

    const parser = new Parser(input);
    parser.parse();

    return parser.root;
}
