import Stringifier from 'postcss/lib/stringifier';

const DEFAULT_RAW = {
    colon:        ': ',
    commentLeft:  ' ',
    commentRight: ' '
};

class SassStringifier extends Stringifier {


    has(value) {
        return typeof value !== 'undefined';
    }

    block(node, start) {
        const between = node.raws.sssBetween || '';
        this.builder(start + between, node, 'start');
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
        const left  = this.has(node.raws.left) ?
            node.raws.left : DEFAULT_RAW.commentLeft;
        const right = this.has(node.raws.right) ?
            node.raws.right : DEFAULT_RAW.commentRight;

        if (node.raws.commentType === 'single') {
            this.builder('//' + left + node.text + right, node);
        } else if (node.raws.commentType === 'multi') {
            this.builder('/*' + left + node.text + right + '*/', node);
        }
    }
}


export default SassStringifier;
