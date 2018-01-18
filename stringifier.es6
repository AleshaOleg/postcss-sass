import Stringifier from 'postcss/lib/stringifier';

class SassStringifier extends Stringifier {

    has(value) {
        return typeof value !== 'undefined';
    }

    block(node, start) {
        this.builder(start, node, 'start');
        if (this.has(node.nodes)) {
            this.body(node);
        }
    }

    decl(node) {
        const between = this.raw(node, 'between', 'colon');
        let string = node.prop + between + this.rawValue(node, 'value');
        if (node.important) {
            string += node.raws.important || ' !important';
        }
        this.builder(string, node);
    }

    comment(node) {
        const left  = this.raw(node, 'left',  'commentLeft');
        const right = this.raw(node, 'right', 'commentRight');

        if ( node.raws.inline ) {
            const text = node.raws.text || node.text;
            this.builder('//' + left + text + right, node);
        } else {
            this.builder('/*' + left + node.text + right + '*/', node);
        }
    }
}


export default SassStringifier;
