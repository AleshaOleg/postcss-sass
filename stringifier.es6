import Stringifier from 'postcss/lib/stringifier';

class SassStringifier extends Stringifier {

    block(node, start) {
        this.builder(start, node, 'start');
        if ( node.nodes && node.nodes.length ) {
            this.body(node);
        }
    }

    decl(node) {
        super.decl(node, false);
    }

    comment(node) {
        const left  = this.raw(node, 'left',  'commentLeft');
        const right = this.raw(node, 'right', 'commentRight');

        if ( node.raws.inline ) {
            this.builder('//' + left + node.text + right, node);
        } else {
            this.builder('/*' + left + node.text + right + '*/', node);
        }
    }
}


export default SassStringifier;
