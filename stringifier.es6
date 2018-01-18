const Stringifier = require('postcss/lib/stringifier');

const SassStringifier = function (builder) {
    Stringifier.call(this, builder);
};

const DEFAULT_RAW = {
    colon:        ': ',
    commentLeft:  ' ',
    commentRight: ' '
};

SassStringifier.prototype = Object.create(Stringifier.prototype);
SassStringifier.prototype.constructor = Stringifier;

SassStringifier.prototype.has = function has(value) {
    return typeof value !== 'undefined';
};

SassStringifier.prototype.block = function (node, start) {
    const between = node.raws.sssBetween || '';
    this.builder(start + between, node, 'start');
    if (this.has(node.nodes)) {
        this.body(node);
    }
};

SassStringifier.prototype.decl = function (node) {
    const between = this.raw(node, 'between', 'colon');
    let string = node.prop + between + this.rawValue(node, 'value');
    if (node.important) {
        string += node.raws.important || ' !important';
    }
    this.builder(string, node);
};

SassStringifier.prototype.comment = function (node) {
    const left  = this.has(node.raws.left) ?
        node.raws.left : DEFAULT_RAW.commentLeft;
    const right = this.has(node.raws.right) ?
        node.raws.right : DEFAULT_RAW.commentRight;

    if (node.raws.commentType === 'single') {
        this.builder('//' + left + node.text + right, node);
    } else if (node.raws.commentType === 'multi') {
        this.builder('/*' + left + node.text + right + '*/', node);
    }
};


module.exports = SassStringifier;
