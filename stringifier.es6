const Stringifier = require('postcss/lib/stringifier')

module.exports = class SassStringifier extends Stringifier {
    block (node, start) {
        this.builder(start, node, 'start')
        if (node.nodes && node.nodes.length) {
            this.body(node)
        }
    }

    decl (node) {
        super.decl(node, false)
    }

    comment (node) {
        let left = this.raw(node, 'left', 'commentLeft')
        let right = this.raw(node, 'right', 'commentRight')

        if (node.raws.inline) {
            this.builder('//' + left + node.text + right, node)
        } else {
            this.builder('/*' + left + node.text + right + '*/', node)
        }
    }
}
